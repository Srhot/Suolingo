import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { firestore } from '@/config/firebase';

export class FirestoreService {
  // Create or set a document
  static async setDocument(
    collectionName: string,
    documentId: string,
    data: DocumentData
  ): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await setDoc(docRef, data, { merge: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to set document: ${error.message}`);
      }
      throw new Error('Failed to set document with unknown error');
    }
  }

  // Get a document
  static async getDocument(collectionName: string, documentId: string): Promise<DocumentData | null> {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get document: ${error.message}`);
      }
      throw new Error('Failed to get document with unknown error');
    }
  }

  // Update a document
  static async updateDocument(
    collectionName: string,
    documentId: string,
    data: Partial<DocumentData>
  ): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await updateDoc(docRef, data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }
      throw new Error('Failed to update document with unknown error');
    }
  }

  // Delete a document
  static async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }
      throw new Error('Failed to delete document with unknown error');
    }
  }

  // Query documents
  static async queryDocuments(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Promise<DocumentData[]> {
    try {
      const q = query(collection(firestore, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);

      const documents: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return documents;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to query documents: ${error.message}`);
      }
      throw new Error('Failed to query documents with unknown error');
    }
  }
}
