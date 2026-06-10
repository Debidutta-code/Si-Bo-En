import { useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { IPropertyAddress, IPropertyDetails } from "../types/types";
import { MapPin, Trash2, Video } from "lucide-react";
import toast from "react-hot-toast";
import PropertyAddress from "@/components/property/show/Address";
import PropertyDetails from "@/components/property/show/PropertyDetails";
import PropertyAmenities from "@/components/property/show/PropertyAmenities";
import Rooms from "@/components/property/show/Rooms";
import BankDetails from "@/components/property/show/BankDetails";
import Loader from "@/components/Loader/Loader";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getPropertyDetails,
  addPropertyVideo,
  deletePropertyVideo,
} from "@/components/property/api/show/propertyDetails";
import BackButton from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import VideoUploadModal from "@/components/property/VedioUpload.modal";
import PropertyMediaGallery from "@/components/property/PropertyMediaGallery";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";


export default function PropertyDetailsPage() {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState<boolean>(false);
  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    propertyName: "",
    propertyEmail: "",
    description: "",
    propertyCategory: {
      masterCategory: {
        id: "",
        categoryName: "",
        description: "",
      }
    },
    propertyContact: "",
    propertyRoom: [],
    propertyType: {
      masterPropertyType: {
        id: "",
        description: "",
        propertyTypeName: "",
      }
    },
    starRating: "",
    propertyCode: "",
    propertyVideos: {
      url: "",
      thumbnail: null
    },
    _translations: {
      propertyName: "",
      description: ""
    }
  });

  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    landmark: "",
    latitude: 0,
    location: "",
    longitude: 0,
    propertyId: "",
    state: "",
    zipCode: 0,
    _translations: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      country: "",
      landmark: "",
      location: "",
      state: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || "property";
  });

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await getPropertyDetails(propertyId);
      if (response.data) {
        const data = response.data;
        setPropertyDetails({
          propertyName: data.propertyName,
          propertyEmail: data.propertyEmail,
          propertyContact: data.propertyContact,
          starRating: data.starRating?.$numberDecimal || data.starRating,
          propertyCategory: data.propertyCategory,
          propertyType: data.propertyType,
          propertyRoom: data.propertyRoom,
          description: data.description,
          propertyCode: data.propertyCode,
          propertyVideos: data.propertyVideos,
          _translations: data._translations
        });
        setPropertyImages(data.image || []);
        if (data.propertyAddress) {
          setPropertyAddress(data.propertyAddress);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to get Property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!propertyId) {
      toast.error("Go back and try again");
      return;
    }
    fetchPropertyDetails(propertyId);
  }, [propertyId]);

  const handleVideoUploadSuccess = async (videoUrl: string, thumbnailUrl: string) => {
    if (!propertyId) {
      toast.error("Property ID is missing");
      return;
    }

    try {
      const response = await addPropertyVideo(propertyId, videoUrl, thumbnailUrl);

      if (response.success) {
        toast.success('Video uploaded and saved successfully!');
        await fetchPropertyDetails(propertyId);
      } else {
        toast.error(response.message || 'Failed to save video');
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to save video');
    }
  };

  const handleDeleteVideo = async () => {
    if (!propertyId) {
      toast.error("Property ID is missing");
      return;
    }

    // Close the dialog first
    setIsDeleteDialogOpen(false);

    try {
      setIsDeletingVideo(true);
      const response = await deletePropertyVideo(propertyId);

      if (response.success) {
        toast.success('Video deleted successfully!');
        await fetchPropertyDetails(propertyId);
      } else {
        toast.error(response.message || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const getFullAddress = () => {
    const parts = [
      propertyAddress._translations ? propertyAddress._translations.city : propertyAddress.city,
      propertyAddress._translations ? propertyAddress._translations.state : propertyAddress.state,
      propertyAddress._translations ? propertyAddress._translations.country : propertyAddress.country,
      propertyAddress.zipCode?.toString(),
    ].filter(Boolean);

    return parts.join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text={t('Property.loadingYourPropertys')} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <BackButton />

        {/* Property Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-6">
          <div className="w-full">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {propertyDetails._translations ? propertyDetails._translations.propertyName : propertyDetails.propertyName}
                </h1>
                <p className="text-base text-gray-600 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  {getFullAddress()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 ml-4">
                <Button
                  variant="outline"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Video className="h-4 w-4" />
                  {propertyDetails.propertyVideos?.url ? t("VideoUpload.updateVideo") : t("VideoUpload.addVideo")}
                </Button>
                {propertyDetails.propertyVideos?.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)} // Changed this line
                    disabled={isDeletingVideo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeletingVideo ? t("VideoUpload.deleting") : t("VideoUpload.deleteVideo")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        <PropertyMediaGallery
          propertyVideo={propertyDetails.propertyVideos?.url ? propertyDetails.propertyVideos : undefined}
          propertyImages={propertyImages}
          type="property"
        />

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setSearchParams(prev => {
              const newParams = new URLSearchParams(prev);
              newParams.set('tab', value);
              return newParams;
            });
          }}
        >
          <TabsContent value="property" className="space-y-6">
            <PropertyDetails propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="address">
            <PropertyAddress propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="amenities">
            <PropertyAmenities propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="rooms" className="space-y-6">
            <Rooms propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="bank-details">
            <BankDetails propertyId={propertyId!} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Video Upload Modal */}
      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onUploadSuccess={handleVideoUploadSuccess}
        title={t("PropertyPage.uploadPropertyVideo")}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("PropertyPage.deleteVideoTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("PropertyPage.deleteVideoDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("VideoUpload.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t("VideoUpload.deleteVideo")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}