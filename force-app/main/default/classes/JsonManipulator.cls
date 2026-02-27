public class JsonManipulator {

    public static String removeSpecificPremise(String jsonInput, String premiseToRemove) {
        // Parse the JSON string into a Map
        Map<String, Object> jsonData = (Map<String, Object>) JSON.deserializeUntyped(jsonInput);

        // Ensure the 'houses' key exists and is an array
        if (jsonData.containsKey('houses') && jsonData.get('houses') instanceof List<Object>) {
            List<Object> houses = (List<Object>) jsonData.get('houses');

            // Loop through each house
            for (Object houseObj : houses) {
                if (houseObj instanceof Map<String, Object>) {
                    Map<String, Object> house = (Map<String, Object>) houseObj;

                    // Ensure the 'premises' key exists and is an array
                    if (house.containsKey('premises') && house.get('premises') instanceof List<Object>) {
                        List<Object> premises = (List<Object>) house.get('premises');

                        // Remove the specified premise if found
                        for (Integer i = 0; i < premises.size(); i++) {
                            if (premiseToRemove.equals(String.valueOf(premises[i]))) {
                                premises.remove(i);
                                break;
                            }
                        }
                    }
                }
            }

            // Serialize the modified data back to JSON
            String modifiedJson = JSON.serialize(jsonData);
            return modifiedJson;
        }

        // Return the original JSON if any validation fails or modification is not possible
        return jsonInput;
    }
}