public class CaseHelper {
    
    public static void ChangeSubject(list<case> kill)
    {
        for(case i : kill)
        {
            if(i.status == 'New')
            {
                i.SuppliedPhone='9876549911';
            }
        }
    }
    
    public static void ReasonUpdate(list<case> ca, map<id,case> oldMap)
    {
         for(case i: ca)
        {
            if( oldMap!=NUll  && i.Reason != oldMap.get(i.Id).Reason )
            {
                i.Description=('Bro eariler reason was '+ oldMap.get(i.Id).Reason +' and now u haved changed the reason to  ' +i.Reason);
            }
            else if(oldMap!=NUll  && i.Reason == oldMap.get(i.Id).Reason )
            {
                 i.Description=('bro this is the same reason '+ i.Reason);
            }
        }
    }

}