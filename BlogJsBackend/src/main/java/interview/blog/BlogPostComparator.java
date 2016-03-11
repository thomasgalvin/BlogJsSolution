package interview.blog;

import java.util.Comparator;

public class BlogPostComparator
    implements Comparator
{
    @Override
    public int compare( Object o1, Object o2 ) {
        BlogPost b1 = (BlogPost)o1;
        BlogPost b2 = (BlogPost)o2;
        
        return (int)( b2.getPubDate() - b1.getPubDate() );
    }
}
