interface CostStats {
  daily: number;
  weekly: number;
  monthly: number;
}

interface CostEntry {
  timestamp: number;
  cost: number;
  service: string;
  operation: string;
}

class CostTrackerClass {
  private costs: CostEntry[] = [];

  track(cost: number, service: string, operation: string): void {
    this.costs.push({
      timestamp: Date.now(),
      cost,
      service,
      operation,
    });
    
    // Clean old entries (keep only 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.costs = this.costs.filter(entry => entry.timestamp > thirtyDaysAgo);
  }

  getStats(): CostStats {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      daily: this.costs
        .filter(entry => entry.timestamp > dayAgo)
        .reduce((sum, entry) => sum + entry.cost, 0),
      weekly: this.costs
        .filter(entry => entry.timestamp > weekAgo)
        .reduce((sum, entry) => sum + entry.cost, 0),
      monthly: this.costs
        .filter(entry => entry.timestamp > monthAgo)
        .reduce((sum, entry) => sum + entry.cost, 0),
    };
  }

  getDetailedStats() {
    return this.costs;
  }
}

export const CostTracker = new CostTrackerClass();

