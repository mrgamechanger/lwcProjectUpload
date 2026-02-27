public class SOQLDemo {
    public static void SoqlQuery(){
        string a='dating';
        list<Account> Accou=[Select id,name,Rating,industry,Type FROM Account Where industry =: a ];
        
        for(Account iwq : Accou){
            system.debug(iwq);
        }
    }
}