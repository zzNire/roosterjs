import { createUndoSnapshotsService } from '../../lib/editor/UndoSnapshotsServiceImpl';
import { Snapshot } from 'roosterjs-content-model-types';
import { Snapshots, UndoSnapshotsService } from 'roosterjs-editor-types';

describe('UndoSnapshotsServiceImpl.ctor', () => {
    it('No param', () => {
        const service = createUndoSnapshotsService();

        expect((service as any).snapshots).toEqual({
            snapshots: [],
            totalSize: 0,
            currentIndex: -1,
            autoCompleteIndex: -1,
            maxSize: 1e7,
        });
    });

    it('Has param', () => {
        const mockedSnapshots = 'SNAPSHOTS' as any;
        const service = createUndoSnapshotsService(mockedSnapshots);

        expect((service as any).snapshots).toEqual(mockedSnapshots);
    });
});

describe('UndoSnapshotsServiceImpl.addSnapshot', () => {
    let service: UndoSnapshotsService<Snapshot>;
    let snapshots: Snapshots<Snapshot>;

    beforeEach(() => {
        snapshots = {
            snapshots: [],
            totalSize: 0,
            currentIndex: -1,
            autoCompleteIndex: -1,
            maxSize: 1e7,
        };
        service = createUndoSnapshotsService(snapshots);
    });

    function runTest(
        maxSize: number,
        action: () => void,
        currentIndex: number,
        totalSize: number,
        snapshotArray: Snapshot[],
        autoCompleteIndex: number
    ) {
        (snapshots as any).maxSize = maxSize;

        action();
        expect(snapshots.currentIndex).toBe(currentIndex);
        expect(snapshots.totalSize).toBe(totalSize);
        expect(snapshots.snapshots).toEqual(snapshotArray);
        expect(snapshots.autoCompleteIndex).toBe(autoCompleteIndex);
    }

    it('Add first snapshot', () => {
        runTest(
            100,
            () => {
                service.addSnapshot(
                    {
                        html: 'test',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
            },
            0,
            4,
            [{ html: 'test', knownColors: [], metadata: {} as any }],
            -1
        );
    });

    it('Add snapshot as autoComplete', () => {
        runTest(
            100,
            () => {
                service.addSnapshot(
                    {
                        html: 'test',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    true
                );
            },
            0,
            4,
            [{ html: 'test', knownColors: [], metadata: {} as any }],
            0
        );
    });

    it('Add second snapshot', () => {
        runTest(
            100,
            () => {
                service.addSnapshot(
                    {
                        html: 'test1',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
                service.addSnapshot(
                    {
                        html: 'test2',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
            },
            1,
            10,
            [
                { html: 'test1', knownColors: [], metadata: {} as any },
                { html: 'test2', knownColors: [], metadata: {} as any },
            ],
            -1
        );
    });

    it('Add oversize snapshot', () => {
        runTest(
            5,
            () => {
                service.addSnapshot(
                    {
                        html: 'test01',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
            },
            -1,
            0,
            [],
            -1
        );
    });

    it('Add snapshot that need to remove existing one because over size', () => {
        runTest(
            5,
            () => {
                service.addSnapshot(
                    {
                        html: 'test1',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
                service.addSnapshot(
                    {
                        html: 'test2',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
            },
            0,
            5,
            [
                {
                    html: 'test2',
                    knownColors: [],
                    metadata: {} as any,
                },
            ],
            -1
        );
    });

    it('Add snapshot that need to remove proceeding snapshots', () => {
        runTest(
            100,
            () => {
                service.addSnapshot(
                    {
                        html: 'test1',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
                service.addSnapshot(
                    {
                        html: 'test2',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
                snapshots.currentIndex = 0;
                service.addSnapshot(
                    {
                        html: 'test03',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
            },
            1,
            11,
            [
                {
                    html: 'test1',
                    knownColors: [],
                    metadata: {} as any,
                },
                {
                    html: 'test03',
                    knownColors: [],
                    metadata: {} as any,
                },
            ],
            -1
        );
    });

    it('Add identical snapshot', () => {
        runTest(
            100,
            () => {
                service.addSnapshot(
                    {
                        html: 'test1',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
                service.addSnapshot(
                    {
                        html: 'test1',
                        knownColors: [],
                        metadata: {} as any,
                    },
                    false
                );
            },
            0,
            5,
            [
                {
                    html: 'test1',
                    knownColors: [],
                    metadata: {} as any,
                },
            ],
            -1
        );
    });

    it('Add snapshot with entity state', () => {
        const mockedMetadata = 'METADATA' as any;
        const mockedEntityStates = 'ENTITYSTATES' as any;

        service.addSnapshot(
            {
                html: 'test',
                metadata: null,
                knownColors: [],
            },
            false
        );

        expect(snapshots.snapshots).toEqual([
            {
                html: 'test',
                metadata: null,
                knownColors: [],
            },
        ]);

        service.addSnapshot(
            {
                html: 'test',
                metadata: mockedMetadata,
                knownColors: [],
            },
            false
        );

        expect(snapshots.snapshots).toEqual([
            {
                html: 'test',
                metadata: mockedMetadata,
                knownColors: [],
            },
        ]);

        service.addSnapshot(
            {
                html: 'test',
                metadata: null,
                knownColors: [],
                entityStates: mockedEntityStates,
            },
            false
        );

        expect(snapshots.snapshots).toEqual([
            {
                html: 'test',
                metadata: mockedMetadata,
                knownColors: [],
            },
            {
                html: 'test',
                metadata: null,
                knownColors: [],
                entityStates: mockedEntityStates,
            },
        ]);
    });
});

describe('UndoSnapshotsServiceImpl.canMove', () => {
    let service: UndoSnapshotsService<Snapshot>;
    let snapshots: Snapshots<Snapshot>;

    beforeEach(() => {
        snapshots = {
            snapshots: [],
            totalSize: 0,
            currentIndex: -1,
            autoCompleteIndex: -1,
            maxSize: 100,
        };
        service = createUndoSnapshotsService(snapshots);
    });

    function runTest(
        currentIndex: number,
        snapshotArray: string[],
        result1: boolean,
        resultMinus1: boolean,
        result2: boolean,
        resultMinus2: boolean,
        result5: boolean,
        resultMinus5: boolean
    ) {
        snapshots.currentIndex = currentIndex;
        snapshots.totalSize = snapshotArray.reduce((v, s) => {
            v += s.length;
            return v;
        }, 0);

        snapshots.snapshots = snapshotArray.map(
            x =>
                ({
                    html: x,
                } as any)
        );

        expect(service.canMove(1)).toBe(result1, 'Move with 1');
        expect(service.canMove(-1)).toBe(resultMinus1, 'Move with -1');
        expect(service.canMove(2)).toBe(result2, 'Move with 2');
        expect(service.canMove(-2)).toBe(resultMinus2, 'Move with -2');
        expect(service.canMove(5)).toBe(result5, 'Move with 5');
        expect(service.canMove(-5)).toBe(resultMinus5, 'Move with -5');
    }

    it('Empty snapshots', () => {
        runTest(-1, [], false, false, false, false, false, false);
    });

    it('One snapshots, start from -1', () => {
        runTest(-1, ['test1'], true, false, false, false, false, false);
    });

    it('One snapshots, start from 0', () => {
        runTest(0, ['test1'], false, false, false, false, false, false);
    });

    it('One snapshots, start from 1', () => {
        runTest(1, ['test1'], false, true, false, false, false, false);
    });

    it('Two snapshots, start from 0', () => {
        runTest(0, ['test1', 'test2'], true, false, false, false, false, false);
    });

    it('Two snapshots, start from 1', () => {
        runTest(1, ['test1', 'test2'], false, true, false, false, false, false);
    });

    it('10 snapshots, start from 0', () => {
        runTest(
            0,
            [
                'test1',
                'test2',
                'test3',
                'test4',
                'test5',
                'test1',
                'test2',
                'test3',
                'test4',
                'test5',
            ],
            true,
            false,
            true,
            false,
            true,
            false
        );
    });

    it('10 snapshots, start from 5', () => {
        runTest(
            5,
            [
                'test1',
                'test2',
                'test3',
                'test4',
                'test5',
                'test1',
                'test2',
                'test3',
                'test4',
                'test5',
            ],
            true,
            true,
            true,
            true,
            false,
            true
        );
    });
});

describe('UndoSnapshotsServiceImpl.move', () => {
    let service: UndoSnapshotsService<Snapshot>;
    let snapshots: Snapshots<Snapshot>;

    beforeEach(() => {
        snapshots = {
            snapshots: [],
            totalSize: 0,
            currentIndex: -1,
            autoCompleteIndex: -1,
            maxSize: 100,
        };
        service = createUndoSnapshotsService(snapshots);
    });

    function runTest(
        currentIndex: number,
        snapshotArray: string[],
        step: number,
        expectedIndex: number,
        expectedSnapshot: string | null
    ) {
        snapshots.currentIndex = currentIndex;
        snapshots.totalSize = snapshotArray.reduce((v, s) => {
            v += s.length;
            return v;
        }, 0);

        snapshots.snapshots = snapshotArray.map(
            x =>
                ({
                    html: x,
                } as any)
        );

        const result = service.move(step);

        expect(snapshots.currentIndex).toEqual(expectedIndex);

        if (expectedSnapshot) {
            expect(result!.html).toBe(expectedSnapshot);
        } else {
            expect(result).toBeNull();
        }
    }

    it('Empty snapshots', () => {
        runTest(-1, [], 0, -1, null);
    });

    it('One snapshots, start from -1', () => {
        runTest(-1, ['test1'], 1, 0, 'test1');
    });

    it('One snapshots, start from 0, move 0', () => {
        runTest(0, ['test1'], 0, 0, 'test1');
    });

    it('One snapshots, start from 0, move 1', () => {
        runTest(0, ['test1'], 1, 0, null);
    });

    it('One snapshots, start from 0, move -1', () => {
        runTest(0, ['test1'], -1, 0, null);
    });

    it('Two snapshots, start from 0, move 1', () => {
        runTest(0, ['test1', 'test2'], 1, 1, 'test2');
    });

    it('Two snapshots, start from 0, move -1', () => {
        runTest(0, ['test1', 'test2'], -1, 0, null);
    });

    it('Two snapshots, start from 1, move -1', () => {
        runTest(1, ['test1', 'test2'], -1, 0, 'test1');
    });

    it('3 snapshots, start from 1, move 2', () => {
        runTest(1, ['test1', 'test2', 'test3'], 2, 1, null);
    });
});

describe('UndoSnapshotsServiceImpl.clearRedo', () => {
    let service: UndoSnapshotsService<Snapshot>;
    let snapshots: Snapshots<Snapshot>;

    beforeEach(() => {
        snapshots = {
            snapshots: [],
            totalSize: 0,
            currentIndex: -1,
            autoCompleteIndex: -1,
            maxSize: 100,
        };
        service = createUndoSnapshotsService(snapshots);
    });

    function runTest(
        currentIndex: number,
        snapshotArray: string[],
        expectedSize: number,
        expectedArray: string[]
    ) {
        snapshots.currentIndex = currentIndex;
        snapshots.totalSize = snapshotArray.reduce((v, s) => {
            v += s.length;
            return v;
        }, 0);

        snapshots.snapshots = snapshotArray.map(
            x =>
                ({
                    html: x,
                } as any)
        );

        service.clearRedo();

        expect(snapshots.snapshots).toEqual(
            expectedArray.map(
                x =>
                    ({
                        html: x,
                    } as any)
            )
        );
        expect(snapshots.totalSize).toBe(expectedSize);
    }

    it('Empty snapshots', () => {
        runTest(-1, [], 0, []);
    });

    it('One snapshots, start from -1', () => {
        runTest(-1, ['test1'], 0, []);
    });

    it('One snapshots, start from 0', () => {
        runTest(0, ['test1'], 5, ['test1']);
    });

    it('Two snapshots, start from 0', () => {
        runTest(0, ['test1', 'test2'], 5, ['test1']);
    });

    it('Two snapshots, start from 1', () => {
        runTest(1, ['test1', 'test2'], 10, ['test1', 'test2']);
    });
});

describe('UndoSnapshotsServiceImpl.canUndoAutoComplete', () => {
    let service: UndoSnapshotsService<Snapshot>;
    let snapshots: Snapshots<Snapshot>;

    beforeEach(() => {
        snapshots = {
            snapshots: [],
            totalSize: 0,
            currentIndex: -1,
            autoCompleteIndex: -1,
            maxSize: 100,
        };
        service = createUndoSnapshotsService(snapshots);
    });

    it('can undo', () => {
        snapshots.autoCompleteIndex = 1;
        snapshots.currentIndex = 2;

        expect(service.canUndoAutoComplete()).toBeTrue();
    });

    it('cannot undo - 1', () => {
        snapshots.autoCompleteIndex = 1;
        snapshots.currentIndex = 3;

        expect(service.canUndoAutoComplete()).toBeFalse();
    });

    it('cannot undo - 2', () => {
        snapshots.autoCompleteIndex = 1;
        snapshots.currentIndex = 1;

        expect(service.canUndoAutoComplete()).toBeFalse();
    });

    it('cannot undo - 3', () => {
        snapshots.autoCompleteIndex = -1;
        snapshots.currentIndex = 0;

        expect(service.canUndoAutoComplete()).toBeFalse();
    });
});