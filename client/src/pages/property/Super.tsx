
import { getCreation } from "./service/creation-filter.service"
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import CreateEntityDialog from "@/components/creation/creationDialog"
import { capitalizeFirstLetter } from '@/lib/utils';
import Loader from '@/components/Loader/Loader';
import type { Icreations, ICreation } from "./types/types"
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Settings } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function HotelsPage() {
  const { t } = useTranslation();
  const { creationId } = useParams<{ creationId: string }>();
  const [searchParams] = useSearchParams();
  const creationIdFromSearch = searchParams.get("isCustomVisible");
  const [isLoading, setIsLoading] = useState(false)
  const [creations, setCreations] = useState<Icreations>({
    brands: [],
    groups: [],
    properties: [],
    regionals: []
  })
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<"group" | "brand" | "property" | "regional">("group")

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const response = await getCreation();
      if (response.success) {
        setCreations(response.data || {
          brands: [],
          groups: [],
          properties: [],
          regionals: []
        });
        if (response.data.groups.length > 0) {
          setCurrentTab("group");

        }
        else if (response.data.brands.length > 0) {
          setCurrentTab("brand");
          return
        }
        else if (response.data.properties.length > 0) {
          setCurrentTab("property");
          return
        }
      } else {
        toast.error(response.message || t('Toast.failedToFetchProperties'));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error(t('Toast.failedToFetchProperties'));
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const getCurrentData = (): ICreation[] => {
    switch (currentTab) {
      case "group":
        return creations.groups;
      case "brand":
        return creations.brands;
      case "property":
        return creations.properties;
      case "regional":
        return creations.regionals;
      default:
        return [];
    }
  };

  const getTabDisplayName = (tab: string): string => {
    const pluralMap: { [key: string]: string } = {
      group: t('PropertySuper.groups'),
      brand: t('PropertySuper.brands'),
      property: t('PropertySuper.properties')
    };
    return pluralMap[tab] || tab;
  };

  if (isLoading) {
    return (
      <div className='min-h-screen w-full flex justify-center items-center'>
        <Loader text={t('PropertySuper.loadingItem', { item: getTabDisplayName(currentTab) })} />
      </div>
    )
  }

  const isCreationButtonVisible = (currentTab: string) => {
    switch (currentTab) {
      case "group":
        return creations.groups.length > 0;
      case "brand":
        return creations.brands.length > 0;
      case "property":
        return creations.properties.length > 0;
      case "regional":
        return creationIdFromSearch && creations.regionals.length > 0;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('PropertySuper.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('PropertySuper.subtitle')}
          </p>
        </div>
        <CreateEntityDialog creationType={"super"} currentTab={currentTab} creationId={creationId ? creationId : ""} level={4} fetchProperties={fetchProperties} />
      </div>

      <div className="flex space-x-2 border-b">
        {(["regional", "group", "brand", "property"] as const).map((tab) => (

          <Button
            key={tab}
            variant={currentTab === tab ? "secondary" : "ghost"}
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-2 rounded-t-lg border-b-2 ${!isCreationButtonVisible(tab) && "hidden"} ${currentTab === tab
              ? "border-primary bg-primary/10 text-primary"
              : "border-transparent hover:border-gray-300"
              }`}
          >
            {capitalizeFirstLetter(getTabDisplayName(tab))} ({
              tab === "regional" ? creations.regionals?.length :
                tab === "group" ? creations.groups?.length :
                  tab === "brand" ? creations.brands?.length :
                    creations.properties?.length
            })
          </Button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {currentData?.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M9 21h4"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('PropertySuper.noFound', { item: getTabDisplayName(currentTab) })}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {t('PropertySuper.getStarted', { item: currentTab })}
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 $`}>
            {currentData.map((item: ICreation) => (
              <div
                key={item.id}
                className={`border rounded-lg overflow-hidden flex flex-col transition-shadow duration-200
      ${item.isDeleted
                    ? "border-red-300 bg-red-50 opacity-60 pointer-events-none"
                    : "hover:shadow-md"
                  }`}
              >
                {/* Image container */}
                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                        e.currentTarget.className = 'w-full h-full object-contain bg-gray-100 p-4';
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center rounded-none
          ${item.isDeleted ? "bg-red-50" : "bg-gray-100"}`}>
                      <svg className={`w-12 h-12 mb-2 ${item.isDeleted ? "text-red-300" : "text-gray-400"}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className={`text-sm ${item.isDeleted ? "text-red-300" : "text-gray-400"}`}>
                        {t('Common.noImage')}
                      </p>
                    </div>
                  )}

                  {/* Deleted badge */}
                  {item.isDeleted && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 bg-red-700 text-red-100
          text-xs font-medium px-2.5 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2-3h6a1 1 0 011 1v1H8V5a1 1 0 011-1z" />
                      </svg>
                      {t('Common.delete') ?? 'Deleted'}
                    </span>
                  )}

                  {/* Striped overlay for deleted */}
                  {item.isDeleted && (
                    <div className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(185,28,28,0.06) 6px, rgba(185,28,28,0.06) 12px)"
                      }} />
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <h3 className={`font-semibold text-lg line-clamp-2
        ${item.isDeleted ? "text-red-800 line-through decoration-red-300" : "text-gray-900"}`}>
                    {item._translations ? item._translations.name : item.name}
                  </h3>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={item.isDeleted}
                      className={`${item.type === "property" ? item.property?.isDraft ? "flex-1" : "hidden" : "flex-1"}
            ${item.isDeleted ? "border-red-200 text-red-400 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        item.type !== "property"
                          ? navigate(`/app/property/${currentTab}/${item.id}`)
                          : navigate(`/property/${item.propertyId}`)
                      }}
                    >
                      {t('Common.viewDetails')}
                    </Button>

                    {item.type === "property" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={item.isDeleted}
                        className={`${!item.property?.isDraft ? "flex-1" : ""}
              ${item.isDeleted ? "border-red-200 text-red-400 cursor-not-allowed" : ""}`}
                        onClick={() => navigate(`/app/property/${currentTab}/${item.id}`)}
                      >
                        <Settings className="h-4 w-4" />
                        {!item.property?.isDraft && (
                          <span className="ml-2">{t('Common.completeSetup')}</span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}