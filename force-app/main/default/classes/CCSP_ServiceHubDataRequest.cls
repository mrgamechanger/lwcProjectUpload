global with sharing class CCSP_ServiceHubDataRequest implements omnistudio.VlocityOpenInterface2 {

    // Updated to match omnistudio.VlocityOpenInterface2 signature and return type
    global Object invokeMethod(
        String methodName,
        Map<String, Object> inputMap,
        Map<String, Object> context,
        Map<String, Object> additionalParams
    ) {
        Map<String, Object> outMap = new Map<String, Object>();
        try {
            if (methodName == 'getFilteredRequestData') {
                getFilteredRequestData(inputMap, outMap);
            } else {
                outMap.put('status', 'ERROR');
                outMap.put('message', 'Unknown methodName: ' + methodName);
            }
        } catch (Exception objException) {
            PS_CreateErrorLog.upsertException(
                PS_CreateErrorLog.logAppException(CCSP_ConstantsUtility.APP_NAME, 'invokeMethod', objException)
            );
            outMap.put('status', 'ERROR');
            outMap.put('message', objException.getMessage());
            outMap.put('stackTrace', objException.getStackTraceString());
        }
        // Must return an Object; Map is acceptable
        return outMap;
    }

    /**
     * @description : Method to filter RequestBody
     * @param       : Map<String, Object> inputMap, Map<String, Object> outMap
     * @author      : Palak Jain - PEJ5
     * @date        : 11/26/2024
     * @return      : void
     */
    public static void getFilteredRequestData(Map<String, Object> inputMap, Map<String, Object> outMap) {
        try {
            Boolean callIntegration = true;
            Map<String, Object> preFilterData = (Map<String, Object>) inputMap.get('PreFilterData');
            String premiseId = (String) preFilterData.get('premiseid');

            if (premiseId == null || String.isBlank(premiseId)) {
                callIntegration = false;
            }

            List<Object> requestData = (List<Object>) preFilterData.get('servicepointids');
            List<Object> filteredRequestData = new List<Object>();
            Map<String, Object> reqMap = new Map<String, Object>();
            Map<String, Object> sendRequestBody = new Map<String, Object>();

            if (callIntegration && requestData != null) {
                for (Object obj : requestData) {
                    Map<String, Object> reqData = (Map<String, Object>) obj;
                    String transformerId = (String) reqData.get('transformerid');
                    String commodity = (String) reqData.get('commodity');

                    System.debug('@@Sai Com: ' + commodity);
                    System.debug('@@Sai Tran: ' + transformerId);

                    if (commodity == 'Electric' && (transformerId == null || transformerId.length() < 12)) {
                        System.debug('@@Sai entered if ------------------');
                    } else {
                        filteredRequestData.add(obj);
                    }
                }
            }

            System.debug('Service Hub Data: ' + filteredRequestData);

            if (filteredRequestData.isEmpty()) {
                callIntegration = false;
            }

            if (callIntegration) {
                reqMap.put('servicepointids', filteredRequestData);
                reqMap.put('premiseid', preFilterData.get('premiseid'));
                reqMap.put('premisestype', preFilterData.get('premisestype'));
                reqMap.put('datefrom', preFilterData.get('datefrom'));
                sendRequestBody.put('servicehub', reqMap);
                outMap.put('filteredRequestData', sendRequestBody);
            }

            outMap.put('callIntegration', callIntegration);

        } catch (Exception objException) {
            PS_CreateErrorLog.upsertException(
                PS_CreateErrorLog.logAppException(CCSP_ConstantsUtility.APP_NAME, 'getFilteredRequestData', objException)
            );
        }
    }
}
