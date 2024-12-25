const vscode = require('vscode');

/**
 * Активируется при запуске команды.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('duplicateDetector.detect', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showWarningMessage('Откройте файл для поиска дубликатов.');
            return;
        }

        const text = editor.document.getText();
        const lines = text.split('\n');

        // Поиск дубликатов строк
        const duplicates = {};
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                if (duplicates[trimmedLine]) {
                    duplicates[trimmedLine].push(index + 1);
                } else {
                    duplicates[trimmedLine] = [index + 1];
                }
            }
        });

        // Фильтрация строк без повторов
        const duplicateLines = Object.entries(duplicates).filter(([, occurrences]) => occurrences.length > 1);

        if (duplicateLines.length === 0) {
            vscode.window.showInformationMessage('Дубликаты не найдены.');
            return;
        }

        // Подсветка повторяющихся строк
        const decorations = [];
        duplicateLines.forEach(([line, occurrences]) => {
            occurrences.forEach((lineNumber) => {
                const range = new vscode.Range(
                    new vscode.Position(lineNumber - 1, 0),
                    new vscode.Position(lineNumber - 1, lines[lineNumber - 1].length)
                );
                decorations.push({ range });
            });
        });

        const decorationType = vscode.window.createTextEditorDecorationType({
			border: '1px solid red',
			backgroundColor: 'rgba(255,255,0,0.3)',
			overviewRulerColor: 'red',
			overviewRulerLane: vscode.OverviewRulerLane.Full
		});
		

        editor.setDecorations(decorationType, decorations);

        // Вывод уведомления с информацией о дубликатах
        const duplicateMessage = duplicateLines.map(([line, occurrences]) => {
            return `Строка: "${line}" встречается на строках ${occurrences.join(', ')}`;
        }).join('\n');

        vscode.window.showInformationMessage('Дубликаты найдены! См. подсветку в редакторе.');
        console.log(duplicateMessage);
    });

    context.subscriptions.push(disposable);
}

/**
 * Деактивация расширения.
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
