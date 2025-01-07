import { create } from '@storybook/theming';
import { addons } from '@storybook/manager-api';

const theme = create({
    base: 'dark',
    brandTitle: 'Cartridge',
    brandUrl: 'https://cartridge.gg',
});

addons.setConfig({
    theme,
});