import { useState } from 'react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
const ExpandableDescription = ({ description }:{description:string}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const charLimit = 150; 
  const { t } = useTranslation();

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
          {isExpanded ? (t('Common.showLess')) : (t('Common.showMore'))}
        </Button>
      )}
    </div>
  );
};

export default ExpandableDescription;