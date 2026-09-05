import { RawOpportunityItem, OpportunitySource } from '../types';

export abstract class BaseAdapter {
  abstract readonly source: OpportunitySource;

  /**
   * Fetches raw opportunity objects from external API/web scraper/fixtures.
   */
  abstract fetchRawData(): Promise<RawOpportunityItem[]>;
}
