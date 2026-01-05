/**
 * JAVARI AI PAGE
 * Uses the proper MainJavariInterface with correct layout
 */
import { MainJavariInterface } from '@/components/javari/MainJavariInterface';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Javari AI - Your Intelligent Assistant | CR AudioViz AI',
  description: 'Chat with Javari AI - upload documents, get answers with citations, and connect to multiple AI providers.',
};

export default function JavariPage() {
  return <MainJavariInterface />;
}
