import { prisma } from '../../config';

const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export async function generateAddOnCategoryCode() {
    let code = '';
    let exists = true;

    while (exists) {
        code = generateCode();
        const existing = await prisma.addonCategory.findUnique({
            where: { code: code },
        });
        exists = !!existing;
    }

    return code;
}

export async function generateAddOnSubCategoryCode() {
    let code = '';
    let exists = true;

    while (exists) {
        code = generateCode();
        const existing = await prisma.addonSubCategory.findUnique({
            where: { code: code },
        });
        exists = !!existing;
    }

    return code;
}

export async function generateAddOnVariantCode() {
    let code = '';
    let exists = true;

    while (exists) {
        code = generateCode();
        const existing = await prisma.addonVariant.findUnique({
            where: { code: code },
        });
        exists = !!existing;
    }

    return code;
}

export async function generateAddOnCode() {
    let code = '';
    let exists = true;

    while (exists) {
        code = generateCode();
        const existing = await prisma.addon.findUnique({
            where: { code: code },
        });
        exists = !!existing;
    }

    return code;
}
