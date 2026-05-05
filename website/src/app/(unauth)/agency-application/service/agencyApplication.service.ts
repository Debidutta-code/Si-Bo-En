import { createAgencyApplicationApi, getAgencyApplicationByIdApi } from "../api";
import { IAgencyApplicationForm, IAgencyApplicationResponse } from "../types";

export const submitAgencyApplicationService = async (
  data: IAgencyApplicationForm
): Promise<IAgencyApplicationResponse> => {
  try {
    if (!data.applicantName.trim())
      return { success: false, message: "Applicant name is required." };
    if (!data.applicantEmail.trim())
      return { success: false, message: "Applicant email is required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.applicantEmail))
      return { success: false, message: "Invalid applicant email address." };
    if (!data.applicantPhone.trim())
      return { success: false, message: "Applicant phone is required." };
    if (!data.applicantPassword.trim())
      return { success: false, message: "Password is required." };
    if (data.applicantPassword.length < 6)
      return { success: false, message: "Password must be at least 6 characters." };
    if (!data.agencyName.trim())
      return { success: false, message: "Agency name is required." };
    if (!data.agencyEmail.trim())
      return { success: false, message: "Agency email is required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.agencyEmail))
      return { success: false, message: "Invalid agency email address." };
    if (!data.contactNo.trim())
      return { success: false, message: "Contact number is required." };
    if (!data.taxNo.trim())
      return { success: false, message: "Tax number is required." };
    if (!data.iataCode.trim())
      return { success: false, message: "IATA code is required." };
    if (!data.address.trim())
      return { success: false, message: "Address is required." };
    if (!data.commissionValue || data.commissionValue <= 0)
      return { success: false, message: "Commission value must be greater than 0." };
    if (data.commissionType === "percentage" && data.commissionValue > 100)
      return { success: false, message: "Percentage commission cannot exceed 100." };

    return await createAgencyApplicationApi(data);
  } catch {
    return { success: false, message: "Failed to submit application." };
  }
};

export const trackAgencyApplicationService = async (
  id: string
): Promise<IAgencyApplicationResponse> => {
  try {
    if (!id)
      return { success: false, message: "Application id is required to track your application." };
    return await getAgencyApplicationByIdApi(id);
  } catch {
    return { success: false, message: "Failed to track application." };
  }
};