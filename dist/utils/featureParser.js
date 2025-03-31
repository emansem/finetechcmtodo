export class FeatureParser {
    static parseFeaturesMd(content, userId) {
        const features = [];
        const sections = content.split('\n## ').filter(Boolean);
        for (const section of sections) {
            const feature = this.parseFeatureSection(section, userId);
            if (feature) {
                features.push(feature);
            }
        }
        return features;
    }
    static parseFeatureSection(section, userId) {
        const lines = section.split('\n').filter(Boolean);
        if (lines.length === 0)
            return null;
        const title = lines[0].replace('# ', '').trim();
        let description = '';
        let category = 'UI Components';
        let type = 'frontend';
        const implementation = {
            frontend: {
                components: [],
                routes: [],
                services: []
            },
            backend: {
                endpoints: [],
                services: [],
                security: []
            }
        };
        const requirements = {
            functional: [],
            technical: [],
            security: []
        };
        const testing = {
            frontend: [],
            backend: [],
            integration: []
        };
        let currentSection = null;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('Category:')) {
                const categoryValue = line.replace('Category:', '').trim();
                category = this.determineCategory(categoryValue);
                continue;
            }
            if (line.startsWith('Type:')) {
                const typeValue = line.replace('Type:', '').trim().toLowerCase();
                type = this.determineType(typeValue);
                continue;
            }
            if (line.startsWith('### Description')) {
                currentSection = 'description';
                continue;
            }
            if (line.startsWith('### Frontend Implementation')) {
                currentSection = 'frontend';
                continue;
            }
            if (line.startsWith('### Backend Implementation')) {
                currentSection = 'backend';
                continue;
            }
            if (line.startsWith('### Requirements')) {
                currentSection = 'requirements';
                continue;
            }
            if (line.startsWith('### Testing')) {
                currentSection = 'testing';
                continue;
            }
            if (line.startsWith('- ')) {
                const item = line.replace('- ', '').trim();
                switch (currentSection) {
                    case 'description':
                        description += item + ' ';
                        break;
                    case 'frontend':
                        if (line.includes('Component:')) {
                            implementation.frontend?.components.push(item.replace('Component:', '').trim());
                        }
                        else if (line.includes('Route:')) {
                            implementation.frontend?.routes.push(item.replace('Route:', '').trim());
                        }
                        else if (line.includes('Service:')) {
                            implementation.frontend?.services.push(item.replace('Service:', '').trim());
                        }
                        break;
                    case 'backend':
                        if (line.includes('Endpoint:')) {
                            implementation.backend?.endpoints.push(item.replace('Endpoint:', '').trim());
                        }
                        else if (line.includes('Service:')) {
                            implementation.backend?.services.push(item.replace('Service:', '').trim());
                        }
                        else if (line.includes('Security:')) {
                            implementation.backend?.security.push(item.replace('Security:', '').trim());
                        }
                        break;
                    case 'requirements':
                        if (line.includes('Functional:')) {
                            requirements.functional.push(item.replace('Functional:', '').trim());
                        }
                        else if (line.includes('Technical:')) {
                            requirements.technical.push(item.replace('Technical:', '').trim());
                        }
                        else if (line.includes('Security:')) {
                            requirements.security.push(item.replace('Security:', '').trim());
                        }
                        break;
                    case 'testing':
                        if (line.includes('Frontend:')) {
                            testing.frontend?.push(item.replace('Frontend:', '').trim());
                        }
                        else if (line.includes('Backend:')) {
                            testing.backend?.push(item.replace('Backend:', '').trim());
                        }
                        else if (line.includes('Integration:')) {
                            testing.integration?.push(item.replace('Integration:', '').trim());
                        }
                        break;
                }
            }
        }
        return {
            title,
            description: description.trim(),
            category,
            type,
            status: 'todo',
            priority: 'medium',
            implementation,
            requirements,
            testing,
            createdBy: userId,
            tags: []
        };
    }
    static determineCategory(category) {
        const categoryMap = {
            'authentication': 'Authentication',
            'user': 'User Management',
            'financial': 'Financial',
            'messaging': 'Messaging',
            'media': 'Media',
            'ui': 'UI Components',
            'security': 'Security',
            'api': 'API Integration',
            'database': 'Database',
            'infrastructure': 'Infrastructure'
        };
        const matchedCategory = Object.entries(categoryMap)
            .find(([key]) => category.toLowerCase().includes(key));
        return matchedCategory ? matchedCategory[1] : 'UI Components';
    }
    static determineType(type) {
        if (type.includes('frontend'))
            return 'frontend';
        if (type.includes('backend'))
            return 'backend';
        return 'both';
    }
}
//# sourceMappingURL=featureParser.js.map