import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { AddonCategoryTranslationRepository } from '../../../repository/features/addons';
import {
    IAddonCategoryTranslation,
    ILocaleBlock,
} from '../../../models/features/addons/category.model';

export class AddonCategoryTranslationService {
    private addonCategoryTranslationRepository: AddonCategoryTranslationRepository;

    constructor() {
        this.addonCategoryTranslationRepository = new AddonCategoryTranslationRepository();
    }

    public async upsert(
        addonCategoryId: string,
        localeData: Partial<Record<string, Partial<ILocaleBlock>>>
    ): Promise<IApiResponse<IAddonCategoryTranslation>> {
        try {
            const data = await this.addonCategoryTranslationRepository.upsert(addonCategoryId, localeData);
            return successResponse('Addon category translation upserted successfully', data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to upsert addon category translation', error.message);
            return errorResponse('Failed to upsert addon category translation');
        }
    }

    public async getTranslated(
        addonCategoryId: string,
        locale: string = 'en'
    ): Promise<IApiResponse<ILocaleBlock>> {
        try {
            const data = await this.addonCategoryTranslationRepository.getTranslated(addonCategoryId, locale);
            if (!data) return errorResponse('Addon category translation not found');
            return successResponse('Addon category translation fetched successfully', data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to get addon category translation', error.message);
            return errorResponse('Failed to get addon category translation');
        }
    }

    public async getAllTranslations(
        addonCategoryId: string
    ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
        try {
            const data = await this.addonCategoryTranslationRepository.getAllTranslations(addonCategoryId);
            if (!data) return errorResponse('Addon category translations not found');
            return successResponse('All addon category translations fetched successfully', data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to get all addon category translations', error.message);
            return errorResponse('Failed to get all addon category translations');
        }
    }

    public async deleteLocale(
        addonCategoryId: string,
        locale: string
    ): Promise<IApiResponse<IAddonCategoryTranslation>> {
        try {
            const data = await this.addonCategoryTranslationRepository.deleteLocale(addonCategoryId, locale);
            if (!data) return errorResponse('Addon category translation not found');
            return successResponse(`Locale '${locale}' deleted successfully`, data);
        } catch (error) {
            if (error instanceof Error) return errorResponse('Failed to delete addon category translation locale', error.message);
            return errorResponse('Failed to delete addon category translation locale');
        }
    }
}