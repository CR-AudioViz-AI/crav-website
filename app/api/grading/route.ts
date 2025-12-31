/**
 * CR AudioViz AI - Central Grading API
 * Grading company data and grade management
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { NextRequest, NextResponse } from 'next/server';

// Major grading companies
const GRADING_COMPANIES = {
  'PSA': {
    name: 'Professional Sports Authenticator',
    url: 'https://www.psacard.com',
    scale: '1-10',
    grades: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
    specialGrades: ['Authentic', 'Authentic Altered'],
    categories: ['trading-cards', 'sports-memorabilia', 'autographs']
  },
  'BGS': {
    name: 'Beckett Grading Services',
    url: 'https://www.beckett.com/grading',
    scale: '1-10',
    grades: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
    specialGrades: ['Pristine 10', 'Black Label 10'],
    categories: ['trading-cards']
  },
  'CGC': {
    name: 'Certified Guaranty Company',
    url: 'https://www.cgccomics.com',
    scale: '0.5-10',
    grades: ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.2', '9.4', '9.6', '9.8', '10.0'],
    specialGrades: ['Restored', 'Qualified'],
    categories: ['comics', 'trading-cards']
  },
  'CBCS': {
    name: 'Comic Book Certification Service',
    url: 'https://www.cbcscomics.com',
    scale: '0.5-10',
    grades: ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0', '9.2', '9.4', '9.6', '9.8', '10.0'],
    categories: ['comics']
  },
  'SGC': {
    name: 'Sportscard Guaranty Corporation',
    url: 'https://www.sgccard.com',
    scale: '1-10',
    grades: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
    categories: ['trading-cards', 'sports-memorabilia']
  },
  'PCGS': {
    name: 'Professional Coin Grading Service',
    url: 'https://www.pcgs.com',
    scale: '1-70',
    grades: Array.from({length: 70}, (_, i) => String(i + 1)),
    specialGrades: ['PR', 'MS', 'SP'],
    categories: ['coins']
  },
  'NGC': {
    name: 'Numismatic Guaranty Company',
    url: 'https://www.ngccoin.com',
    scale: '1-70',
    grades: Array.from({length: 70}, (_, i) => String(i + 1)),
    specialGrades: ['PR', 'MS', 'SP', 'PL', 'DPL'],
    categories: ['coins']
  },
  'JSA': {
    name: 'James Spence Authentication',
    url: 'https://www.spenceloa.com',
    scale: 'Pass/Fail',
    grades: ['Certified', 'Witness'],
    categories: ['autographs', 'sports-memorabilia']
  },
  'BAS': {
    name: 'Beckett Authentication Services',
    url: 'https://www.beckett-authentication.com',
    scale: 'Pass/Fail',
    grades: ['Certified', 'Witnessed'],
    categories: ['autographs', 'sports-memorabilia']
  }
};

// Condition descriptors for ungraded items
const CONDITIONS = {
  'Mint': { code: 'M', description: 'Perfect condition, no flaws' },
  'Near Mint': { code: 'NM', description: 'Nearly perfect, minor imperfections' },
  'Excellent': { code: 'EX', description: 'Light wear, still displays well' },
  'Very Good': { code: 'VG', description: 'Moderate wear, some flaws visible' },
  'Good': { code: 'G', description: 'Heavy wear, still complete' },
  'Fair': { code: 'FR', description: 'Significant damage, major flaws' },
  'Poor': { code: 'PR', description: 'Heavy damage, barely acceptable' }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const category = searchParams.get('category');

    // Return specific company
    if (company && GRADING_COMPANIES[company.toUpperCase()]) {
      return NextResponse.json({ 
        company: company.toUpperCase(),
        ...GRADING_COMPANIES[company.toUpperCase()]
      });
    }

    // Return companies for specific category
    if (category) {
      const filtered = Object.entries(GRADING_COMPANIES)
        .filter(([_, data]) => data.categories.includes(category))
        .reduce((acc, [key, data]) => ({ ...acc, [key]: data }), {});
      return NextResponse.json({ companies: filtered, category });
    }

    // Return all companies and conditions
    return NextResponse.json({ 
      companies: GRADING_COMPANIES,
      conditions: CONDITIONS
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
