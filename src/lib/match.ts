import { FieldPath, type Firestore } from 'firebase-admin/firestore';

/**
 * Deterministic therapist assignment.
 * Picks the first active therapist ordered by document id.
 */
export async function assignTherapist(db: Firestore): Promise<string> {
  const snap = await db
    .collection('therapists')
    .where('active', '==', true)
    .orderBy(FieldPath.documentId())
    .limit(1)
    .get();

  if (snap.empty) {
    throw new Error('no_active_therapist');
  }

  return snap.docs[0].id;
}
