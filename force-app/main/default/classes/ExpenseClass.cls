public with sharing class ExpenseClass {
    @AuraEnabled
    public static Expense__c createExpense(String NewExpenseName, Date NewExpenseDate, Decimal NewAmount, String NewStatus) {
        if (NewExpenseName != null && NewExpenseDate != null && NewAmount != null && NewStatus != null) {
            List<Expense__c> existingExpenses = [SELECT Id FROM Expense__c 
                                                 WHERE Name = :NewExpenseName 
                                                 AND Expense_Date__c = :NewExpenseDate 
                                                 AND Expense_Amount__c = :NewAmount];

            if (!existingExpenses.isEmpty()) {
                throw new AuraHandledException('Duplicate expense record exists.');
            }

            Expense__c ExpenseObj = new Expense__c();
            ExpenseObj.Name = NewExpenseName;
            ExpenseObj.Expense_Date__c = NewExpenseDate;
            ExpenseObj.Expense_Amount__c = NewAmount;
            ExpenseObj.Expense_Status__c = NewStatus;

            insert ExpenseObj;
            return ExpenseObj;
        }
        return null;
    }

    @AuraEnabled
    public static List<Expense__c> getExpensesByDate(Date minDate, Date maxDate) {
        return [SELECT Id, Name, Expense_Date__c, Expense_Amount__c, Expense_Status__c 
                FROM Expense__c 
                WHERE Expense_Date__c >= :minDate AND Expense_Date__c <= :maxDate];
    }
}