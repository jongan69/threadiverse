import { Publication } from '@lens-protocol/react-web';
import { BonsaiPost } from '../providers/SupabaseProvider';

interface ContentMedia {
  content: string;
  mediaItems: Array<{
    type: string;
    url: string;
  }>;
  template?: {
    id: string;
    name: string;
  };
}

// Parse content and media from publication metadata
export function parseContentMedia(publication: Publication): ContentMedia {
  // Default values
  let content = '';
  let mediaItems: Array<{ type: string; url: string }> = [];
  let template;

  try {
    // Extract content from metadata
    content = publication.metadata.content || '';
    
    // Extract media items
    if (publication.metadata.media && publication.metadata.media.length > 0) {
      mediaItems = publication.metadata.media.map(item => {
        // Determine media type
        let type = 'unknown';
        if (item.mimeType?.startsWith('image/')) {
          type = 'image';
        } else if (item.mimeType?.startsWith('video/')) {
          type = 'video';
        }
        
        return {
          type,
          url: item.original.url
        };
      });
    }
    
    // Check for Bonsai template info in attributes
    const bonsaiAttr = publication.metadata.attributes?.find(
      attr => attr.key === 'bonsaiTemplate'
    );
    
    if (bonsaiAttr) {
      template = {
        id: bonsaiAttr.value,
        name: publication.metadata.attributes?.find(
          attr => attr.key === 'bonsaiTemplateName'
        )?.value || 'Bonsai Template'
      };
    }
  } catch (error) {
    console.error('Error parsing publication content:', error);
  }

  return { content, mediaItems, template };
}

// Upload content to Bonsai
export async function uploadBonsaiContent(post: BonsaiPost): Promise<string> {
  // In a real implementation, this would call the Bonsai API
  // For the demo, we'll return a mock URI
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful Bonsai content creation
  const mockBonsaiUri = `bonsai://${post.templateId}/${Date.now()}`;
  
  return mockBonsaiUri;
}

// Fetch Bonsai content
export async function fetchBonsaiContent(uri: string): Promise<any> {
  // In a real implementation, this would call the Bonsai API
  // For the demo, we'll return mock data
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock content based on URI
  if (uri?.includes('text-image')) {
    return {
      text: 'This is a text and image post from Bonsai Smart Media',
      imageUrl: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };
  } else if (uri?.includes('article')) {
    return {
      title: 'Sample Article',
      text: 'This is a sample article created with Bonsai Smart Media'
    };
  } else if (uri?.includes('poll')) {
    return {
      question: 'What is your favorite blockchain?',
      options: ['Ethereum', 'Polygon', 'Solana', 'Other'],
      votes: [42, 78, 23, 15]
    };
  }
  
  // Default fallback
  return {
    text: 'Bonsai Smart Media content'
  };
}