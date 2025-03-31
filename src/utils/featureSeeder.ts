import { db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Feature, FeatureTeam } from '../types/feature';

interface FeatureSection {
    title: string;
    team: FeatureTeam;
    features: string[];
    subsections?: { [key: string]: string[] };
}

export const parseFeatures = (content: string): FeatureSection[] => {
    const sections: FeatureSection[] = [];
    let currentSection: FeatureSection | null = null;
    let currentSubsection: string | null = null;

    const lines = content.split('\n');

    lines.forEach(line => {
        line = line.trim();

        // Skip empty lines and comments
        if (!line || line.startsWith('//') || line.startsWith('\'')) return;

        // Main section headers
        if (line.startsWith('## ')) {
            if (currentSection) {
                sections.push(currentSection);
            }
            const title = line.replace('## ', '').trim();
            const team: FeatureTeam = title.toLowerCase().includes('frontend') ? 'frontend' : 'backend';
            currentSection = {
                title,
                team,
                features: [],
                subsections: {}
            };
            currentSubsection = null;
        }
        // Subsection headers
        else if (line.startsWith('### ')) {
            if (currentSection) {
                currentSubsection = line.replace('### ', '').trim();
                if (!currentSection.subsections![currentSubsection]) {
                    currentSection.subsections![currentSubsection] = [];
                }
            }
        }
        // Feature items
        else if (line.startsWith('- ')) {
            const feature = line.replace('- ', '').trim();
            if (currentSection) {
                if (currentSubsection) {
                    currentSection.subsections![currentSubsection].push(feature);
                } else {
                    currentSection.features.push(feature);
                }
            }
        }
    });

    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
};

export const seedFeatures = async (sections: FeatureSection[], adminUid: string) => {
    const frontendBatch = writeBatch(db);
    const backendBatch = writeBatch(db);
    let frontendOrder = 1000;
    let backendOrder = 1000;

    sections.forEach(section => {
        const team = section.team;
        const batch = team === 'frontend' ? frontendBatch : backendBatch;
        const featuresRef = collection(db, `${team}_features`);

        // Add main features
        section.features.forEach(featureTitle => {
            const order = team === 'frontend' ? frontendOrder += 1000 : backendOrder += 1000;
            const docRef = doc(featuresRef);
            const feature: Omit<Feature, 'id'> = {
                title: featureTitle,
                description: `Implementation of ${featureTitle}`,
                team,
                status: 'todo',
                priority: 'medium',
                createdBy: adminUid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                order,
                tags: [section.title]
            };
            batch.set(docRef, feature);
        });

        // Add subsection features
        if (section.subsections) {
            Object.entries(section.subsections).forEach(([subsectionName, features]) => {
                features.forEach(featureTitle => {
                    const order = team === 'frontend' ? frontendOrder += 1000 : backendOrder += 1000;
                    const docRef = doc(featuresRef);
                    const feature: Omit<Feature, 'id'> = {
                        title: featureTitle,
                        description: `Implementation of ${featureTitle} in ${subsectionName}`,
                        team,
                        status: 'todo',
                        priority: 'medium',
                        createdBy: adminUid,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        order,
                        tags: [section.title, subsectionName]
                    };
                    batch.set(docRef, feature);
                });
            });
        }
    });

    // Commit the batches
    await Promise.all([
        frontendBatch.commit(),
        backendBatch.commit()
    ]);
};

export const loadFeaturesFromMd = async (adminUid: string) => {
    try {
        const response = await fetch('/features.md');
        const content = await response.text();
        const sections = parseFeatures(content);
        await seedFeatures(sections, adminUid);
        console.log('Features successfully loaded into Firebase');
    } catch (error) {
        console.error('Error loading features:', error);
        throw error;
    }
};