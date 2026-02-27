global class CCSP_CheckDepositCreationScenario implements VlocityOpenInterface2 {
    string AccountType;
    string customerClass;
    boolean isCreateDeposit = false;
    boolean dontReviewAndRefundFlag = false;

    /**
     * @description: This method is invoked from Vlocity Integration Procedure.
     * @param String methodName, Map<String, Object> inputMap, Map<String, Object> outMap
     * @return Boolean
     */
    global Boolean invokeMethod(String methodName, Map<String, Object> inputs, Map<String, Object> output, Map<String, Object> options) {
        try {
            // Function to retrieve first element in the list after splitting via delimiter
            if (methodName == 'CCSP_ConstantsUtility.CHECK_REGEXP') {
                string ciRecordID = (string)inputs.get('ContextId');
                string osType = (string)inputs.get('OSType');
                customerClass = (string)inputs.get('customerClass');

                string accountID = getAccountDetails(ciRecordID); // Get accountType and accountDetails
                
                if (accountID == null) {
                    isCreateDeposit = true;
                    getOutputMap(output);
                    return true; // If Deposit billing AccountID is blank, return control
                }

                string accVsSAType = checkForExistingSA(accountID);

                if (osType == 'Restore' && accVsSAType != 'depositExists') {
                    isCreateDeposit = true;
                    getOutputMap(output);
                    return true; // Process deposit for Restore OSType
                }
            }

            return checkDepositStartValidation(accVsSAType,inputs, output);
        } catch (Exception objException) {
            PS_CreateErrorLog.userException('CCSP_CheckDepositCreationScenario', objException);
            return false;
        }
    }
       
 /**
     * @description: Validate deposit creation start conditions.
     */
    global boolean checkDepositStartValidation(String accVsSAType, Map<String, Object> output, Map<String, Object> inputs) {
        string ciRecordID = (string)inputs.get('ContextId');
        string osType = (string)inputs.get('OSType');
        string accountID = getAccountDetails(ciRecordID); // Fetch account details

        // Check deposit conditions
        if (accVsSAType == 'isPriorAccount' || accVsSAType == 'depositExists' || accVsSAType == 'NEW_CUSTOMER') {
            isCreateDeposit = checkCreateDeposit(accVsSAType);
            getOutputMap(output);
            return true; // If Deposit SA exists, return control
        }

        // Validate TIN and SSN
        if (osType != 'Restore') {
            Map<String, Object> inputMap = (Map<String, Object>)inputs.get('MCOR'); // Commented in some cases
            boolean validTINandSSN = validateTINandSSN(inputs);

            if (validTINandSSN) {
                isCreateDeposit = true;
                dontReviewAndRefundFlag = true;
                getOutputMap(output);
                return true;
            }
        }

        // Evaluate account risk level for OSType 'Restore'
        if (osType == 'Restore') {
            string accountRiskLevel = getAccountRiskLevel(accountID, ciRecordID, output);
            getOutputMap(output);
            return true;
        }

        return false;
    }
    
    /**
     * @description: Fetch account details based on Customer Interaction record ID.
     * @param ciRecordID: String - Customer Interaction record ID.
     * @return: String - Account ID or 'NEW_CUSTOMER'.
     */
    global string getAccountDetails(string ciRecordID) {
        string accountID;
        List<vlocity_cmt__CustomerInteraction__c> ciRecordList = [
            SELECT Id, vlocity_cmt__AccountId__c, CCSP_Account_Type__c 
            FROM vlocity_cmt__CustomerInteraction__c 
            WHERE Id = :ciRecordID
        ];

        // Check if Customer Interaction Record exists
        if (ciRecordList.size() > 0) {
            AccountType = ciRecordList[0].CCSP_Account_Type__c;
            accountID = ciRecordList[0].vlocity_cmt__AccountId__c;
        } else {
            AccountType = 'NEW_CUSTOMER';
        }

        return accountID;
    }
    global Boolean checkCreateDeposit(String accVsSAType) {
        if (accVsSAType == 'isPriorAccount' || accVsSAType == 'NEW_CUSTOMER') {
            return true;
        } else {
            return false;
        }
    }
    /**
     * @description: Check for existing deposit Service Agreements (SA).
     * @param accountID: String - Account ID to validate.
     * @return: String - Status ('depositExists' / 'isExistingAccount').
     */
    global string checkForExistingSA(string accountID) {
        boolean depositSAExist = false;
        AccountType = 'PRIOR_ACCOUNT';

        for (Asset__c SA : [
            SELECT Id, CCSP_SA_Type__c, CCSP_SA_Status__c 
            FROM Asset__c 
            WHERE vlocity_cmt__BillingAccountId__c = :accountID 
              AND (CCSP_SA_Status__c = 'Active' OR CCSP_SA_Status__c = 'Pending Start')
        ]) {
            if (SA.CCSP_SA_Type__c == 'DEP-CIA' && SA.CCSP_SA_Status__c == 'Active') {
                depositSAExist = true;
                break;
            }
        }

        return depositSAExist ? 'depositExists' : 'isExistingAccount';
    }

    /**
     * @description: Validate SSN and TIN inputs.
     * @param inputMap: Map<String, Object> - Contains SSN and TIN for validation.
     * @return: Boolean - True if both SSN and TIN are valid.
     */
    global boolean validateTINandSSN(Map<String, Object> inputMap) {
        boolean ssnCheck, tinCheck;
        String ssn = (String)inputMap.get('SSN');
        String tin = (String)inputMap.get('TIN');

        ssnCheck = Pattern.matches('^[0-9]{9}$', ssn);
        tinCheck = Pattern.matches('^[0-9]{4}$', tin);

        return ssnCheck && tinCheck;
    }

    /**
     * @description: Get the account risk level based on account alerts.
     * @param accountID: String - Account ID.
     * @param contextID: String - Context ID.
     * @param output: Map<String, Object> - Stores output data.
     * @return: String - Risk level ('Low Risk', 'Medium Risk').
     */
    global string getAccountRiskLevel(string accountID, string contextID, Map<String, Object> output) {
        String accountRiskLevel;

        try {
            List<AccountAlerts__c> listOfAccountAlerts = [
                SELECT Id, acct_id__c, alert_type_cd__c, description__c 
                FROM AccountAlerts__c 
                WHERE acct_id__c = :accountID AND alert_type_cd__c LIKE 'CRALERT%'
                LIMIT 1
            ];

            if (listOfAccountAlerts.size() > 0) {
                accountRiskLevel = listOfAccountAlerts[0].description__c;

                if (accountRiskLevel != null && accountRiskLevel.contains('Low Risk')) {
                    isCreateDeposit = false;
                } else {
                    isCreateDeposit = true;
                }
            } else {
                accountRiskLevel = 'Medium Risk';
                isCreateDeposit = true;
            }
        } catch (Exception e) {
            PS_CreateErrorLog.userException('CCSP_CheckDepositCreationScenario', e);
        }

        return accountRiskLevel;
    }

    /**
     * @description: Populate output map for integration.
     * @param outputMap: Map<String, Object> - The map to populate with output data.
     */
    global void getOutputMap(Map<String, Object> outputMap) {
        Map<String, Object> innerData = new Map<String, Object>();
        innerData.put('AccountType', AccountType);

        if (customerClass == 'RES') {
            innerData.put('CreateDeposit', false);
            innerData.put('isNonResClass', false);
        } else {
            innerData.put('CreateDeposit', isCreateDeposit);
            innerData.put('isNonResClass', true);
        }

        innerData.put('dontReviewAndRefundFlag', dontReviewAndRefundFlag);
        innerData.put('UnmeteredSA', false);
        innerData.put('ABSBilledSA', false);

        outputMap.put('DepositsSA', innerData);
    }
}
