// @jest-environment node
import * as vscode from "vscode"
import { DiffViewProvider } from "../DiffViewProvider"

jest.mock("vscode", () => ({
	...jest.requireActual("vscode"),
	workspace: {
		getConfiguration: jest.fn(),
	},
	window: {
		tabGroups: { all: [] },
		visibleTextEditors: [],
		onDidChangeActiveTextEditor: jest.fn(),
		showTextDocument: jest.fn(),
	},
	commands: {
		executeCommand: jest.fn(),
	},
	Uri: {
		file: jest.requireActual("vscode").Uri.file,
		parse: jest.requireActual("vscode").Uri.parse,
	},
	ViewColumn: { Beside: 2 },
	TextEditorRevealType: { AtTop: 1, InCenter: 2 },
	Position: jest.requireActual("vscode").Position,
	Range: jest.requireActual("vscode").Range,
	Selection: jest.requireActual("vscode").Selection,
}))

describe("DiffViewProvider", () => {
	const cwd = "/mock"
	const relPath = "file.txt"
	let provider: DiffViewProvider

	beforeEach(() => {
		jest.clearAllMocks()
		provider = new DiffViewProvider(cwd)
		provider["relPath"] = relPath
		provider["editType"] = "modify"
		provider["originalContent"] = "original"
	})

	it("should pass preserveFocus: false when autoFocus is true", async () => {
		;(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
			get: () => true,
		})
		const executeCommand = vscode.commands.executeCommand as jest.Mock
		executeCommand.mockResolvedValue(undefined)
		const promise = provider["openDiffEditor"]()
		// Simulate editor activation
		setTimeout(() => {
			const fakeEditor = { document: { uri: { fsPath: "/mock/file.txt" } } }
			const cb = (vscode.window.onDidChangeActiveTextEditor as jest.Mock).mock.calls[0][0]
			cb(fakeEditor)
		}, 10)
		await promise
		expect(executeCommand).toHaveBeenCalledWith(
			"vscode.diff",
			expect.anything(),
			expect.anything(),
			expect.anything(),
			expect.objectContaining({ preserveFocus: false }),
		)
	})

	it("should pass preserveFocus: true when autoFocus is false", async () => {
		;(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
			get: () => false,
		})
		const executeCommand = vscode.commands.executeCommand as jest.Mock
		executeCommand.mockResolvedValue(undefined)
		const promise = provider["openDiffEditor"]()
		// Simulate editor activation
		setTimeout(() => {
			const fakeEditor = { document: { uri: { fsPath: "/mock/file.txt" } } }
			const cb = (vscode.window.onDidChangeActiveTextEditor as jest.Mock).mock.calls[0][0]
			cb(fakeEditor)
		}, 10)
		await promise
		expect(executeCommand).toHaveBeenCalledWith(
			"vscode.diff",
			expect.anything(),
			expect.anything(),
			expect.anything(),
			expect.objectContaining({ preserveFocus: true }),
		)
	})
})
