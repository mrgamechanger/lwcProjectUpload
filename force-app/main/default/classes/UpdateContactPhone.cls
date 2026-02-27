public class UpdateContactPhone {
    
    public static void UpPhone()
    {
        list<contact> con=new list<contact>([select id, name,phone ,Account.phone from Contact where AccountId!=null]);
        for(contact c:con)
        {
            if(c.Phone==Null)
            {
                c.Phone= c.Account.phone;
            }
        }
        
        if(!con.isEmpty())
        {
            update con;
        }
        
    }

}