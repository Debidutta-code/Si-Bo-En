import { prisma } from '../../config';
import { IChildAddon, ICChildAddoon, IUpdateChildAddon } from '../interfaces';
export class ChildAddonRepository {
    public async createChildAddons(add: ICChildAddoon): Promise<IChildAddon> {
        try {
            const childAddon = await prisma.childAddon.create({
                data: add,
            });
            return childAddon;
        } catch (error) {
            throw new Error('Failed to create child addons');
        }
    }
    public async getChildAddons(addonId: string): Promise<IChildAddon[]> {
        try {
            const childAddons = await prisma.childAddon.findMany({
                where: { addonId },
            });
            return childAddons;
        } catch (error) {
            throw new Error('Failed to retrieve child addons');
        }
    }
    public async getById(id: string): Promise<IChildAddon | null> {
        try {
            const childAddon = await prisma.childAddon.findUnique({
                where: { id },
            });
            return childAddon;
        } catch (error) {
            throw new Error('Failed to retrieve child addon');
        }
    }
    public async updateChildAddon(
        id: string,
        data: IUpdateChildAddon
    ): Promise<IChildAddon | null> {
        try {
            const updatedChildAddon = await prisma.childAddon.update({
                where: { id },
                data,
            });
            return updatedChildAddon;
        } catch (error) {
            throw new Error('Failed to update child addon');
        }
    }
    public async deleteChildAddon(id: string): Promise<boolean> {
        try {
            await prisma.childAddon.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            throw new Error('Failed to delete child addon');
        }
    }
}
