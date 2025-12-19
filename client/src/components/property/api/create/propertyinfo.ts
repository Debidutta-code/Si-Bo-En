import createAxiosInstance from "@/components/axiosInstance";
import type { IPropertyDetails } from "@/components/property/update/types/types";
import toast from "react-hot-toast";
export const getAllCategory = async () => {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.get(
      "property-management/property/management/category/get"
    );
    return response.data;
  } catch (error: any) {
    return error?.response.data;
  }
};
export const getAllPropertyType = async () => {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.get(
      "/property-management/property/management/type/get"
    );
    return response.data;
  } catch (error: any) {
    return error?.response.data;
  }
};
export const getAllDestinationType = async () => {
  const axiosInstance = createAxiosInstance();
  try {
    const response = await axiosInstance.get(
      "property-management/property/management/destination-type/get"
    );

    return response.data;
  } catch (error: any) {
    return error?.response.data;
  }
};
export const uploadImages = async (files: File[]) => {
  const axiosInstance = createAxiosInstance();

  const formData = new FormData();
  files.forEach((file) => formData.append("file", file));

  try {
    const response = await axiosInstance.post("/property-management/upload", formData, {});
    if(!response.data.success){
      toast.error(response.data.message);
      return
    }
    return response.data.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw new Error("Image upload failed");
  }
};
export const createProperty = async (propertyInfo: IPropertyDetails, creationId: any) => {
  const axiosInstance = createAxiosInstance();

  try {
    const response = await axiosInstance.post("/property-management/property", { ...propertyInfo, creationId });

    return response.data;
  } catch (error:any) {
    console.error("Upload failed", error);
    return error.response.data
  }
};
export const updatePropertyById=async(propertyId:string,propertyInfo: IPropertyDetails)=>{
    const axiosInstance = createAxiosInstance();

  try {
    const response = await axiosInstance.patch(`/property-management/property/${propertyId}`, propertyInfo);
    return response.data;
  } catch (error:any) {
    console.error("Upload failed", error);
    return error.response.data
  }
}
