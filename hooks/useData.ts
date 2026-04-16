import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

type EntityType = 'services' | 'projects' | 'packages' | 'maintenancePlans' | 'settings';

export function useData<T>(entity: EntityType) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    let res: { data: unknown[] | null; error: string | null } = { data: null, error: null };

    switch (entity) {
      case 'services':
        res = await dataService.getServices();
        break;
      case 'projects':
        res = await dataService.getProjects();
        break;
      case 'packages':
        res = await dataService.getPackages();
        break;
      case 'maintenancePlans':
        res = await dataService.getMaintenancePlans();
        break;
      case 'settings':
        res = await dataService.getSettings();
        break;
      default:
        res.error = `Unknown entity: ${entity}`;
    }

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setData(res.data as unknown as T[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [entity]);

  return { data, loading, error, refresh: fetchData };
}
