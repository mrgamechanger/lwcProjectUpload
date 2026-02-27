public class Empoyupdate {
    public static void updateRating(List<Employee__c> empList){
    
        for(Employee__c emp:empList)
        {
             if( emp.salary__c==null){
                 emp.dateofjoin__c=System.today();       
                            emp.salary__c=15000;
 }
        }
    }

}