import { useState } from 'react';
import { Button } from './ui/button';

const ExpandableDescription = ({ description }:{description:string}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const charLimit = 150; 

  if (!description) {
    return null; 
  }
  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <p className={`text-sm mt-2 text-justify transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {description}
      </p>

      {/* Only show the button if the text is long enough to be clamped */}
      {description.length > charLimit && (
        <Button
        variant={'ghost'}
          onClick={toggleReadMore}
          className="text-primary hover:underline text-sm font-semibold p-0"
        >
          {isExpanded ? 'Show less' : 'Read more...'}
        </Button>
      )}
    </div>
  );
};

export default ExpandableDescription;