import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Site, KeywordData, ChangelogItem } from '../types/seo';

// Save or sync User Profile
export async function saveUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  try {
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'RichScore Owner',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Subscribe to User Sites
export function subscribeToSites(
  userId: string,
  onUpdate: (sites: Site[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/sites`;
  const sitesCollection = collection(db, 'users', userId, 'sites');

  return onSnapshot(
    sitesCollection,
    (snapshot) => {
      const sites: Site[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        sites.push({
          id: docSnap.id,
          name: data.name || 'Untitled Site',
          url: data.url || 'https://example.com',
          builder: data.builder || 'framer',
          scriptVerified: Boolean(data.scriptVerified),
          scriptToken: data.scriptToken || `rs_live_${docSnap.id}`,
          fixMode: data.fixMode || 'approve',
          scriptRevoked: Boolean(data.scriptRevoked),
          overallScore: data.overallScore ?? 54,
          projectedScore: data.projectedScore ?? 92,
          pagesScanned: data.pagesScanned ?? 14,
          lastCrawledAt: data.lastCrawledAt || 'Just now',
          subScores: data.subScores || {
            technical: 68,
            contentKeywords: 54,
            schemaMeta: 39,
            mediaA11y: 60,
          },
          issues: data.issues || [],
        });
      });
      onUpdate(sites);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

// Save or update site
export async function saveSiteToFirestore(userId: string, site: Site): Promise<void> {
  const path = `users/${userId}/sites/${site.id}`;
  try {
    const siteRef = doc(db, 'users', userId, 'sites', site.id);
    await setDoc(siteRef, {
      id: site.id,
      userId,
      name: site.name,
      url: site.url,
      builder: site.builder,
      scriptVerified: site.scriptVerified,
      scriptToken: site.scriptToken,
      fixMode: site.fixMode,
      scriptRevoked: site.scriptRevoked,
      overallScore: site.overallScore,
      projectedScore: site.projectedScore,
      pagesScanned: site.pagesScanned,
      lastCrawledAt: site.lastCrawledAt,
      subScores: site.subScores,
      issues: site.issues,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete site
export async function deleteSiteFromFirestore(userId: string, siteId: string): Promise<void> {
  const path = `users/${userId}/sites/${siteId}`;
  try {
    const siteRef = doc(db, 'users', userId, 'sites', siteId);
    await deleteDoc(siteRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to User Keywords
export function subscribeToKeywords(
  userId: string,
  onUpdate: (keywords: KeywordData[]) => void
) {
  const path = `users/${userId}/keywords`;
  const colRef = collection(db, 'users', userId, 'keywords');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const keywords: KeywordData[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        keywords.push({
          id: docSnap.id,
          keyword: d.keyword,
          volume: d.volume ?? 1200,
          difficulty: d.difficulty ?? 25,
          intent: d.intent ?? 'Commercial',
          cpc: d.cpc ?? 2.5,
          cluster: d.cluster ?? 'General',
          currentRank: d.currentRank ?? 15,
          rankDelta: d.rankDelta ?? 0,
          impressions: d.impressions ?? 4500,
          clicks: d.clicks ?? 120,
          pageTarget: d.pageTarget,
          dropReason: d.dropReason,
          rankHistory: d.rankHistory || undefined,
        });
      });
      onUpdate(keywords);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Save Keyword
export async function saveKeywordToFirestore(
  userId: string,
  kw: KeywordData
): Promise<void> {
  const path = `users/${userId}/keywords/${kw.id}`;
  try {
    const kwRef = doc(db, 'users', userId, 'keywords', kw.id);
    await setDoc(kwRef, {
      id: kw.id,
      userId,
      keyword: kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      intent: kw.intent,
      cpc: kw.cpc,
      cluster: kw.cluster,
      currentRank: kw.currentRank,
      previousRank: kw.previousRank,
      rankDelta: kw.rankDelta,
      impressions: kw.impressions,
      clicks: kw.clicks,
      pageTarget: kw.pageTarget || null,
      dropReason: kw.dropReason || null,
      ...(kw.rankHistory ? { rankHistory: kw.rankHistory } : {}),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to Changelog
export function subscribeToChangelog(
  userId: string,
  onUpdate: (items: ChangelogItem[]) => void
) {
  const path = `users/${userId}/changelog`;
  const colRef = collection(db, 'users', userId, 'changelog');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ChangelogItem[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          siteId: d.siteId,
          issueId: d.issueId,
          type: d.type,
          page: d.page,
          title: d.title,
          before: d.before,
          after: d.after,
          appliedBy: d.appliedBy,
          timestamp: d.timestamp,
          status: d.status,
        });
      });
      // Sort newest first
      items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Save Changelog Item
export async function saveChangelogToFirestore(
  userId: string,
  item: ChangelogItem
): Promise<void> {
  const path = `users/${userId}/changelog/${item.id}`;
  try {
    const logRef = doc(db, 'users', userId, 'changelog', item.id);
    await setDoc(logRef, {
      id: item.id,
      userId,
      siteId: item.siteId,
      issueId: item.issueId,
      type: item.type,
      page: item.page,
      title: item.title,
      before: item.before,
      after: item.after,
      appliedBy: item.appliedBy,
      timestamp: item.timestamp,
      status: item.status,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
