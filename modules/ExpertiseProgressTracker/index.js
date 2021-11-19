import { Setting, SettingsObject } from 'SettingsManager/SettingsManager';
import { killsPerLevel } from './constants';

// gui
const moveGui = new Gui()

moveGui.registerDraw(() => {
	const text = 'Drag to move the Expertise Progress Tracker';
	const scale = 4;
	const color = Renderer.color(255, 55, 55);
	new Text(text, Renderer.screen.getWidth() / 2 - Renderer.getStringWidth(text) * scale / 2, Renderer.screen.getHeight() / 2 - 50).setColor(color).setScale(scale).draw();
});


// settings
const settings = new SettingsObject('ExpertiseProgressTracker', [
	{
		name: 'display settings',
		settings: [
			new Setting.Toggle('Enabled', true),
			new Setting.Toggle('Text Shadow', true),
			new Setting.TextInput('Prefix', '&7[&6Expertise&7] &f'),
			new Setting.StringSelector('Number Formatting', 0, [ 'None', 'Dot', 'Comma', 'Space' ]),
			new Setting.Slider('x', 0.0015, 0, 1).setHidden(true),
			new Setting.Slider('y', 0.230, 0, 1).setHidden(true),
			new Setting.Button('Move Display', 'click', () => moveGui.open()),
		],
	},
]).setCommand('expertise').setSize(250, 100);

Setting.register(settings);


register('dragged', (dx, dy) => {
	if (!moveGui.isOpen()) return;

	expertiseDisplay.setRenderLoc(
		expertiseDisplay.getRenderX() + dx,
		expertiseDisplay.getRenderY() + dy,
	);

	settings.getSettingObject('display settings', 'x').value = MathLib.map(
		expertiseDisplay.getRenderX(),
		0, Renderer.screen.getWidth(),
		0, 1
	);
	settings.getSettingObject('display settings', 'y').value = MathLib.map(
		expertiseDisplay.getRenderY(),
		0, Renderer.screen.getHeight(),
		0, 1
	);

	settings.save();
});


// draw display
const expertiseDisplay = new Display();

expertiseDisplay.addLine(1);
expertiseDisplay.setRenderLoc(
	Renderer.screen.getWidth() * settings.getSetting('display settings', 'x'),
	Renderer.screen.getHeight() * settings.getSetting('display settings', 'y'),
);

register('renderOverlay', () => {
	if (!settings.getSetting('display settings', 'Enabled')) return expertiseDisplay.shouldRender = false;

	expertiseDisplay.shouldRender = true;

	expertiseDisplay
		.setRenderLoc(
			Renderer.screen.getWidth() * settings.getSetting('display settings', 'x'),
			Renderer.screen.getHeight() * settings.getSetting('display settings', 'y'),
		)
		.render();
});

// update display
const maxLevel = Math.max(...Object.keys(killsPerLevel));

const getNextKillCount = kills => {
	let nextKillCount;

	for (let index = 1; index <= maxLevel; index++) {
		nextKillCount = killsPerLevel[index];
		if (kills < killsPerLevel[index]) break;
	}

	return nextKillCount;
}

const localeString = (number, separator) => {
	if (!separator) return number;
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

register('step', () => {
	let kills;

	Player
		.getInventory()
		.getItems()
		.filter(item => item.getID() === 346) // minecraft:fishing_rod
		.reverse() // to get kills from rod that is closest to hotbar slot 1
		.forEach(item => {
			const nbtData = item.getItemNBT().getCompoundTag('tag').getCompoundTag('ExtraAttributes');
			if (!nbtData.get('expertise_kills')) return;
			kills = nbtData.getInteger('expertise_kills');
		});

	let separator;

	switch (settings.getSetting('display settings', 'Number Formatting')) {
		case 'Dot':
			separator = '.';
			break;

		case 'Comma':
			separator = ',';
			break;

		case 'Space':
			separator = ' ';
			break;
	}	
	
	expertiseDisplay.setLine(1, new DisplayLine(`${settings.getSetting('display settings', 'Prefix')}${isNaN(kills) ? '-/-' : kills < killsPerLevel[maxLevel] ? localeString(kills, separator) + '/' + localeString(getNextKillCount(kills), separator) : localeString(kills, separator)+ ' (Maxed)'}`).setShadow(settings.getSetting('display settings', 'Text Shadow')));
}).setFps(5);