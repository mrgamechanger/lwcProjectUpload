/**
 * Story No : C2022-30471
 * Modifications Log
 * Ver   Date        Author        Modification
 * ----  ----------  ------------  -------------
 *       11/27/2024  Palak
 */

 @IsTest
 public class CCSP_ServiceHubDataRequestTest {
 
     /**
      * @description: setup data required for testing
      * @author      : Palak
      * @date        : 11/27/2024
      */
     @TestSetup
     static void setup() {
         List<vlocity_cmt__Premises__c> premiseList;
         List<vlocity_cmt__InventoryItem__c> meterList;
 
         User systemAdminUser = CCSP_TestDataFactory.createTestCCSPAdminRunUser();
 
         System.runAs(systemAdminUser) {
             // Create test data
             premiseList = CCSP_TestDataFactory.createPremises();
             List<vlocity_cmt__ServicePoint__c> spList = CCSP_TestDataFactory.createServicePoints();
             insert spList;
 
             Account acct1 = CCSP_TestDataFactory.createAccount();
             List<Asset> assetList = CCSP_TestDataFactory.createServiceAgreement();
             assetList[0].AccountId = acct1.Id;
             insert assetList;
 
             meterList = CCSP_TestDataFactory.createMeter();
         }
     }
 
     /**
      * @author : Palak
      * @date   : 11/27/2024
      */
     @IsTest
     static void testgetFilteredRequestData() {
         try {
             List<Object> spList = new List<Object>();
             Map<String, Object> spMap = new Map<String, Object>();
 
             spMap.put('transformerid', '315215444988');
             spMap.put('servicepointid', '2399126521');
             spMap.put('commodity', 'Electric');
             spList.add(spMap);
 
             spMap = new Map<String, Object>();
             spMap.put('servicepointid', '5466298305');
             spMap.put('commodity', 'Gas');
             spList.add(spMap);
 
             Map<String, Object> testInput = new Map<String, Object>();
             testInput.put('premisestype', 'Known');
             testInput.put('premiseid', '2399126501');
             testInput.put('datefrom', '2023-11-27');
             testInput.put('servicepointids', spList);
 
             Test.startTest();
             Map<String, Object> inputMap = new Map<String, Object>();
             Map<String, Object> outMap = new Map<String, Object>();
             Map<String, Object> options = new Map<String, Object>();
 
             inputMap.put('PreFilterData', testInput);
 
             CCSP_ServiceHubDataRequest serviceHubData = new CCSP_ServiceHubDataRequest();
             serviceHubData.invokeMethod('getFilteredRequestData', inputMap, outMap, options);
 
             Object results = outMap.get('callIntegration');
             List<Object> resList = (List<Object>) results;
 
             if (resList != null) {
                 System.assertEquals(true, resList.size() > 0);
             }
 
             Test.stopTest();
         } catch (Exception objException) {
             PS_CreateErrorLog.upsertException(
                 PS_CreateErrorLog.logAppException(
                     CCSP_ConstantsUtility.APP_NAME,
                     'testgetFilteredRequestData',
                     objException
                 )
             );
         }
     }
 
     /**
      * @description: Method to cover getFilteredRequestData scenario when Premise Id is null
      * @author      : Palak
      * @date        : 11/27/2024
      */
     @IsTest
     static void testgetFilteredRequestData2() {
         try {
             Map<String, Object> testInput = new Map<String, Object>();
             testInput.put('premisestype', 'Known');
             testInput.put('premiseid', '');
             testInput.put('datefrom', '2023-11-27');
 
             Test.startTest();
             Map<String, Object> inputMap = new Map<String, Object>();
             Map<String, Object> outMap = new Map<String, Object>();
             Map<String, Object> options = new Map<String, Object>();
 
             inputMap.put('PreFilterData', testInput);
 
             CCSP_ServiceHubDataRequest serviceHubData = new CCSP_ServiceHubDataRequest();
             serviceHubData.invokeMethod('getFilteredRequestData', inputMap, outMap, options);
 
             Object results = outMap.get('callIntegration');
             List<Object> resList = (List<Object>) results;
 
             if (resList != null) {
                 System.assertEquals(true, resList.size() > 0);
             }
 
             Test.stopTest();
         } catch (Exception objException) {
             PS_CreateErrorLog.upsertException(
                 PS_CreateErrorLog.logAppException(
                     CCSP_ConstantsUtility.APP_NAME,
                     'testgetFilteredRequestData2',
                     objException
                 )
             );
         }
     }
 }
 