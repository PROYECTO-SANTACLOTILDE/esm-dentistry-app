import { useMemo } from 'react';
import { type FetchResponse, fhirBaseUrl, openmrsFetch, useDebounce } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface LocationResponse {
  type: string;
  total: number;
  resourceType: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  id: string;
  entry: Array<LocationEntry>;
}

export interface LocationEntry {
  resource: Resource;
}
export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  status: 'active' | 'inactive';
  meta?: {
    tag?: Array<{
      code: string;
      display: string;
      system: string;
    }>;
  };
}

interface UseLocationsResult {
  locations: Array<LocationEntry>;
  isLoading: boolean;
  loadingNewData: boolean;
}

export function useLocations(locationTag: string | null, searchQuery: string = ''): UseLocationsResult {
  const debouncedSearchQuery = useDebounce(searchQuery);

  const constructUrl = useMemo(() => {
    let url = `${fhirBaseUrl}/Location?`;
    let urlSearchParameters = new URLSearchParams();
    urlSearchParameters.append('_summary', 'data');

    if (!debouncedSearchQuery) {
      urlSearchParameters.append('_count', '10');
    }

    if (locationTag) {
      urlSearchParameters.append('_tag', locationTag);
    }

    if (typeof debouncedSearchQuery === 'string' && debouncedSearchQuery != '') {
      urlSearchParameters.append('name:contains', debouncedSearchQuery);
    }

    return url + urlSearchParameters.toString();
  }, [locationTag, debouncedSearchQuery]);

  const { data, error, isLoading, isValidating } = useSWR<FetchResponse<LocationResponse>, Error>(
    constructUrl,
    openmrsFetch,
  );

  return useMemo(
    () => ({
      locations: data?.data?.entry || [],
      isLoading,
      loadingNewData: isValidating,
    }),
    [data, isLoading, isValidating],
  );
}
