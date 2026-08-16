import { gqlRequest } from '../graphql-client';
import type { AnalyticsDashboard } from '../types';

const ANALYTICS_DASHBOARD_QUERY = /* GraphQL */ `
  query AnalyticsDashboard {
    analyticsDashboard {
      userGrowth {
        date
        count
      }
      roleBreakdown {
        role
        online
        offline
      }
      topCities {
        term
        count
      }
      geoClusters {
        geohash
        latitude
        longitude
        count
      }
      topRatedPosts {
        postId
        postTitle
        averageRating
        ratingCount
      }
      commentVelocity {
        date
        count
        dailyChange
      }
      commenterSentiment {
        userId
        userName
        positiveCount
        criticalCount
      }
      negativeCommentTerms {
        term
        score
        docCount
      }
    }
  }
`;

export async function analyticsDashboardQuery(token: string): Promise<AnalyticsDashboard> {
  const data = await gqlRequest<{ analyticsDashboard: AnalyticsDashboard }>(
    ANALYTICS_DASHBOARD_QUERY,
    undefined,
    token,
  );
  return data.analyticsDashboard;
}
