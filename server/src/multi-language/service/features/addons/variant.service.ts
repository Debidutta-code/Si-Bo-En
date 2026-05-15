import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { AddonVariantTranslationRepository } from '../../../repository/features/addons/variant.repository';
import {
    IAddonVariantTranslation,
    ILocaleBlock,
} from '../../../models/features/addons/variant.model';

export class AddonVariantTranslationService {
    private addonVariantTranslationRepository: AddonVariantTranslationRepository;

    constructor() {
        this.addonVariantTranslationRepository = new AddonVariantTranslationRepository();
    }

    public async upsert(
        addonVariantId: string,
        localeData: Partial<Record<string, Partial<ILocaleBlock>>>
    ): Promise<IApiResponse<IAddonVariantTranslation>> {
        try {
            const data = await this.addonVariantTranslationRepository.upsert(addonVariantId, localeData);
            return successResponse('Addon variant translation upserted successfully', data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to upsert addon variant translation', error.message);
            return errorResponse('Failed to upsert addon variant translation');
        }
    }

    public async getTranslated(
        addonVariantId: string,
        locale: string = 'en'
    ): Promise<IApiResponse<ILocaleBlock>> {
        try {
            const data = await this.addonVariantTranslationRepository.getTranslated(addonVariantId, locale);
            if (!data) return errorResponse('Addon variant translation not found');
            return successResponse('Addon variant translation fetched successfully', data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to get addon variant translation', error.message);
            return errorResponse('Failed to get addon variant translation');
        }
    }

    public async getAllTranslations(
        addonVariantId: string
    ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
        try {
            const data = await this.addonVariantTranslationRepository.getAllTranslations(addonVariantId);
            if (!data) return errorResponse('Addon variant translations not found');
            return successResponse('All addon variant translations fetched successfully', data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to get all addon variant translations', error.message);
            return errorResponse('Failed to get all addon variant translations');
        }
    }

    public async deleteLocale(
        addonVariantId: string,
        locale: string
    ): Promise<IApiResponse<IAddonVariantTranslation>> {
        try {
            const data = await this.addonVariantTranslationRepository.deleteLocale(addonVariantId, locale);
            if (!data) return errorResponse('Addon variant translation not found');
            return successResponse(`Locale '${locale}' deleted successfully`, data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to delete addon variant translation locale', error.message);
            return errorResponse('Failed to delete addon variant translation locale');
        }
    }
}
