import { useEffect, useState } from "react";
import { type IPropertyAddress } from "../types/types";
import { getPropertyAddress } from "../api/show/propertyAddress";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../../ui/button";
import { PenTool, X, Globe, Languages, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import AddPropertyAddressLangDialog from "../multilang/components/AddPropertyAddressLangDialog";
import CheckPropertyAddressLangDialog from "../multilang/components/CheckPropertyAddressLangDialog";
import { upsertPropertyAddressTranslationService } from "../multilang/services/property-address.services";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import UpdatePropertyAddress from "../update/PropertyAddress";
import { updatePropertyAddress } from "../api/create/propertyAddress";
import { EditTranslationDialog } from "@/pages/management/components/multilang/ManagementTranslationDialogs";
import { useTranslation } from "react-i18next";
interface PropertyId {
  propertyId: string;
}

export default function PropertyAddress({ propertyId }: PropertyId) {
    const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    landmark: "",
    latitude: "",
    longitude: "",
    location: "",
        _translations: {
        addressLine1: "",
        addressLine2: "",
        country: "",
        state: "",
        city: "",
        location: "",
        landmark: ""
    }

  });

  const fetchPropertyAddress = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await getPropertyAddress(propertyId);
      if (response.success) {
        const data = response.data;
        setPropertyAddress({
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          country: data.country,
          state: data.state,
          city: data.city,
          zipCode: data.zipCode,
          landmark: data.landmark,
          latitude: data.latitude,
          longitude: data.longitude,
          location: data.location,
          _translations:data._translations
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || t('Toast.failedToFetchAddress'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) {
      toast.error(t('Toast.propertyIdNotFound'));
      return;
    }
    fetchPropertyAddress(propertyId);
  }, [propertyId]);
  const updateAddress = async (
    propertyId: string,
    payload: IPropertyAddress
  ) => {
    setLoading(true);
    try {
      payload = {
        ...payload,
        country: payload.country,
        state: payload.state,
        zipCode: payload.zipCode.toString() || "",
      };
      const response = await updatePropertyAddress(propertyId, payload);
      if (response.success) {
        toast.success(t('Toast.addressUpdated'));
      } else {
       toast.error(
          response?.message ||
          t('Toast.failedToUpdateAddress')
        );
      }
    } catch (error) {
      toast.error(t('Toast.failedToUpdateAddress'));
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader text={t('PropertyDetails.loadingAddress')} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {t('PropertyDetails.propertyAddress')}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {t('PropertyDetails.addressDescription')}
            </p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <PenTool className="h-4 w-4" />
                {t('PropertyDetails.editAddress')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <AlertDialogHeader>
                <div className="flex w-full justify-between items-start">
                  <div>
                    <AlertDialogTitle className="text-xl">
                      {t('PropertyDetails.updatePropertyAddress')}
                    </AlertDialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('PropertyDetails.modifyLocation')}
                    </p>
                  </div>
                  <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </AlertDialogCancel>
                </div>
                <UpdatePropertyAddress
                  address={propertyAddress}
                  setAddress={setPropertyAddress}
                  isLoading={loading}
                />
              </AlertDialogHeader>
              <AlertDialogFooter className="border-t pt-4">
                <AlertDialogCancel>{t('PropertyDetails.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e: any) => {
                    e.preventDefault();
                    updateAddress(propertyId, propertyAddress);
                  }}
                  disabled={loading}
                >
                  {loading ? t('PropertyDetails.updatingAddress') : t('PropertyDetails.updateAddress')}
                </AlertDialogAction>
              </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <Globe className="h-4 w-4" />
                 {t( 'Property.translations')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAddTranslationOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> {t('Common.addTranslation')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCheckTranslationsOpen(true)}>
                  <Languages className="h-4 w-4 mr-2" /> {t('Common.checkTranslation')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AddPropertyAddressLangDialog open={addTranslationOpen} onOpenChange={setAddTranslationOpen} propertyAddressId={propertyId} />
            <CheckPropertyAddressLangDialog
              open={checkTranslationsOpen}
              onOpenChange={setCheckTranslationsOpen}
              propertyAddressId={propertyId}
              onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
            />
            <EditTranslationDialog
              open={editTranslationOpen}
              onOpenChange={setEditTranslationOpen}
              entityId={propertyId}
              locale={editingLocale}
              initialData={editingData}
              title={t("AddPropertyAddressLangDialog.edit")}
              fields={[
                { key: "addressLine1", label: t("AddPropertyAddressLangDialog.form.addressLine1"), placeholder: t("AddPropertyAddressLangDialog.formEx.addressLine1") },
                { key: "addressLine2", label: t("AddPropertyAddressLangDialog.form.addressLine2"), placeholder: t("AddPropertyAddressLangDialog.formEx.addressLine2") },
                { key: "city", label: t("AddPropertyAddressLangDialog.form.city"), placeholder: t("AddPropertyAddressLangDialog.formEx.city") },
                { key: "state", label: t("AddPropertyAddressLangDialog.form.state"), placeholder: t("AddPropertyAddressLangDialog.formEx.state") },
                { key: "country", label: t("AddPropertyAddressLangDialog.form.country"), placeholder: t("AddPropertyAddressLangDialog.formEx.country") },
                { key: "location", label: t("AddPropertyAddressLangDialog.form.location"), placeholder: t("AddPropertyAddressLangDialog.formEx.location") },
                { key: "landmark", label: t("AddPropertyAddressLangDialog.form.landmark"), placeholder: t("AddPropertyAddressLangDialog.formEx.landmark") },
              ]}
              onSave={async (id, locale, data) => upsertPropertyAddressTranslationService(id, { [locale]: data })}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.addressLine1')}
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress._translations?propertyAddress._translations.addressLine1:propertyAddress.addressLine1 || (
                  <span className="text-gray-400 italic">{t('PropertyDetails.notSpecified')}</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.addressLine2')}
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress._translations?propertyAddress._translations.addressLine2:propertyAddress.addressLine2 || (
                  <span className="text-gray-400 italic">{t('PropertyDetails.notSpecified')}</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.locationArea')}
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress._translations?propertyAddress._translations.location:propertyAddress.location || (
                  <span className="text-gray-400 italic">{t('PropertyDetails.notSpecified')}</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.landmark')}
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress._translations?propertyAddress._translations.landmark:propertyAddress.landmark || (
                  <span className="text-gray-400 italic">{t('PropertyDetails.notSpecified')}</span>
                )}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.city')}
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress._translations?propertyAddress._translations.city:propertyAddress.city || (
                  <span className="text-gray-400 italic">{t('PropertyDetails.notSpecified')}</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.stateCountry')}
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.state && propertyAddress.country ? (
                  <>
                    {propertyAddress._translations?propertyAddress._translations.state:propertyAddress.state}, {propertyAddress._translations?propertyAddress._translations.country:propertyAddress.country}
                  </>
                ) : (
                  <span className="text-gray-400 italic">{t('PropertyDetails.notSpecified')}</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.zipCode')}
              </label>
              <p className="text-base text-gray-900 font-mono">
                {propertyAddress.zipCode || (
                  <span className="text-gray-400 italic font-sans">
                    {t('PropertyDetails.notSpecified')}
                  </span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('PropertyDetails.gpsCoordinates')}
              </label>
              <div className="flex items-center gap-3 text-sm text-gray-900 font-mono">
                {propertyAddress.latitude && propertyAddress.longitude ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">{t('PropertyDetails.lat')}:</span>
                      <span>{propertyAddress.latitude}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">{t('PropertyDetails.lng')}:</span>
                      <span>{propertyAddress.longitude}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400 italic font-sans">
                    {t('PropertyDetails.notSpecified')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
