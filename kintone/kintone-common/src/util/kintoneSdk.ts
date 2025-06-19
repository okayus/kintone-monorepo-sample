import type {
  KintoneFormFieldProperty,
  KintoneRestAPIClient,
} from "@kintone/rest-api-client";

import type {
  AppID,
  Record,
} from "@kintone/rest-api-client/lib/src/client/types";

export class KintoneSdk {
  private restApiClient: KintoneRestAPIClient;

  constructor(restApiClient: KintoneRestAPIClient) {
    this.restApiClient = restApiClient;
  }

  public async getApps() {
    const apps = await this.restApiClient.app.getApps({
      ids: null,
      codes: null,
      name: null,
      spaceIds: null,
    });
    return apps;
  }

  public async fetchFields({ app, preview = true }: { app: AppID; preview?: boolean }) {
    const fields = (
      await this.restApiClient.app.getFormFields({ app, preview })
    ).properties;
    return fields;
  }

  public async getViews({ app }: { app: AppID }) {
    const views = await this.restApiClient.app.getViews({ app });
    return views;
  }

  public async getRecords({
    app,
    fields = [],
    query = "",
  }: {
    app: AppID;
    fields?: string[];
    query?: string;
  }) {
    const MAX_READ_LIMIT = 500;
    const MAX_TOTAL_RECORDS = 10000;

    let allRecords: Record[] = [];
    let offset = 0;

    while (allRecords.length < MAX_TOTAL_RECORDS) {
      const effectiveQuery = query.trim() ? `${query} ` : "";
      const paginatedQuery = `${effectiveQuery}limit ${MAX_READ_LIMIT} offset ${offset}`;

      const response = await this.restApiClient.record.getRecords({
        app,
        fields,
        query: paginatedQuery,
      });

      allRecords = allRecords.concat(response.records);

      if (response.records.length < MAX_READ_LIMIT) break;

      offset += MAX_READ_LIMIT;
    }

    return { records: allRecords };
  }

  public async updateRecord({
    app,
    id,
    record,
    revision,
  }: {
    app: AppID;
    id: number;
    record: Record;
    revision?: string;
  }) {
    const params: any = {
      app,
      id,
      record,
    };
    
    if (revision !== undefined) {
      params.revision = revision;
    }
    
    const res = await this.restApiClient.record.updateRecord(params);
    return res;
  }

  public async updateAllRecords({
    app,
    records,
  }: {
    app: AppID;
    records: Array<{ id: string; record: Record; revision?: string }>;
  }) {
    const res = await this.restApiClient.record.updateAllRecords({
      app,
      records,
    });
    return res;
  }
}

export type kintoneType = KintoneFormFieldProperty.OneOf["type"];