public with sharing class testController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> testmethodopgf( string searchkey) {
        try{
        string key='%'+ searchkey +'%';
        
            return[select id,name from Contact  where name like :key]; // Query your data here
        }
    
    catch(Exception e)
    {
          throw new AuraHandledException(e.getMessage());
    }

    }
}