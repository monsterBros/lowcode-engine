import { MaterialMeta } from '@/types';
import { materialsMeta } from '../meta/schema';

/**
 * 物料注册中心
 */
class MaterialRegistry {
    private materials: Map<string, MaterialMeta> = new Map();

    constructor() {
        // 初始化注册所有物料
        this.registerMaterials(materialsMeta);
    }

    /**
     * 批量注册物料
     */
    registerMaterials(materials: MaterialMeta[]): void {
        materials.forEach((material) => {
            this.materials.set(material.componentName, material);
        });
    }

    /**
     * 注册单个物料
     */
    registerMaterial(material: MaterialMeta): void {
        this.materials.set(material.componentName, material);
    }

    /**
     * 获取所有物料
     */
    getAllMaterials(): MaterialMeta[] {
        return Array.from(this.materials.values());
    }

    /**
     * 根据组件名获取物料元数据
     */
    getMaterial(componentName: string): MaterialMeta | undefined {
        return this.materials.get(componentName);
    }

    /**
     * 根据分类获取物料
     */
    getMaterialsByCategory(category: string): MaterialMeta[] {
        return this.getAllMaterials().filter((m) => m.category === category);
    }

    /**
     * 判断组件是否为容器
     */
    isContainer(componentName: string): boolean {
        const material = this.getMaterial(componentName);
        return material?.configure?.component?.isContainer || false;
    }
}

// 导出单例
export const materialRegistry = new MaterialRegistry();
export default materialRegistry;
