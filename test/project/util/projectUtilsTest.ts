import "mocha";

import * as assert from "power-assert";

import { defer } from "../../../src/internal/common/Flushable";
import { AllFiles } from "../../../src/project/fileGlobs";
import { InMemoryProject } from "../../../src/project/mem/InMemoryProject";
import { deleteFiles, doWithFiles, fileExists, saveFromFiles } from "../../../src/project/util/projectUtils";
import { tempProject } from "../utils";

describe("projectUtils", () => {

    it("exists: not found", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        fileExists(t, AllFiles, f => f.name === "nonsense")
            .then(yes => {
                assert(!yes);
            })
            .then(done, done);
    });

    it("exists: found", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        fileExists(t, AllFiles, f => f.name === "Thing")
            .then(yes => {
                assert(yes);
            })
            .then(done, done);
    });

    it("saveFromFiles", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        saveFromFiles<string>(t, AllFiles, f => {
            return f.path;
        })
            .then(gathered => {
                assert(gathered.length === 1);
                assert(gathered[0] === "Thing");
            })
            .then(done, done);
    });

    it("withFiles: run", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        doWithFiles(t, AllFiles, f => {
            f.recordSetContent(f.getContentSync() + "2");
        })
            .then(p => {
                const f = t.findFileSync("Thing");
                assert(f.getContentSync() === "12");
            })
            .then(done, done);
    });

    it("withFiles: defer", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        defer(t, doWithFiles(t, AllFiles, f => {
            f.recordSetContent(f.getContentSync() + "2");
        }));
        assert(t.findFileSync("Thing").getContentSync() === "1");
        assert(t.dirty);
        t.flush()
            .then(files => {
                assert(!t.dirty);
                const f = t.findFileSync("Thing");
                assert(f.getContentSync() === "12");
            })
            .then(done, done);
    });

    it("withFiles: defer use of script", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        defer(t, doWithFiles(t, AllFiles, f => {
            return Promise.resolve(f.recordSetContent(f.getContentSync() + "2"));
        }));
        assert(t.findFileSync("Thing").getContentSync() === "1");
        assert(t.dirty);
        t.flush()
            .then(files => {
                assert(!t.dirty);
                const f = t.findFileSync("Thing");
                assert(f.getContentSync() === "12");
            })
            .then(done, done);
    });

    it("withFiles: run with promise", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        doWithFiles(t, AllFiles, f => {
            return f.setContent(f.getContentSync() + "2");
        })
            .then(p => {
                assert(!!p);
                const f = t.findFileSync("Thing");
                assert(f.getContentSync() === "12");
            })
            .then(done, done);
    });

    it("withFiles: defer with promise", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        defer(t, doWithFiles(t, AllFiles, f => {
            return f.setContent(f.getContentSync() + "2");
        }));
        assert(t.dirty);
        t.flush()
            .then(files => {
                assert(!t.dirty);
                const f = t.findFileSync("Thing");
                assert(f.getContentSync() === "12");
            })
            .then(done, done);
    });

    it("deleteFiles deletes none", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        deleteFiles(t, AllFiles, f => false)
            .then(count => {
                assert(count === 0);
            })
            .then(done, done);
    });

    it("deleteFiles: run deletes 2", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        t.addFileSync("config/Thing", "1");
        deleteFiles(t, "**/Thing", f => true)
            .then(count => {
                assert(count === 2, `Only deleted ${count}`);
            })
            .then(done, done);
    });

    it("deleteFiles: defer deletes 2", done => {
        const t = new InMemoryProject();
        t.addFileSync("Thing", "1");
        t.addFileSync("config/Thing", "1");
        defer(t, deleteFiles(t, "**/Thing", f => true));
        assert(t.fileCount === 2);
        t.flush()
            .then(count => {
                assert(t.fileCount === 0);
            })
            .then(done, done);
    });

    it("deleteFiles: run deletes conditionally", done => {
        const t = tempProject();
        t.addFileSync("Thing", "1");
        t.addFileSync("config/Thing", "1");
        deleteFiles(t, "**/Thing", f => f.path.includes("config"))
            .then(count => {
                assert(count === 1, `Only deleted ${count}`);
            })
            .then(done, done);
    });

    it("deleteFiles: defer deletes conditionally", done => {
        const t = new InMemoryProject();
        t.addFileSync("Thing", "1");
        t.addFileSync("config/Thing", "1");
        defer(t, deleteFiles(t, "**/Thing", f => f.path.includes("config")));
        assert(t.fileCount === 2);
        t.flush()
            .then(_ => {
                assert(t.fileCount === 1);
            })
            .then(done, done);
    });

    it("replaces literals across project", done => {
        const p = tempProject();
        p.addFileSync("Thing", "A");
        p.addFileSync("config/Thing", "B");
        doWithFiles(p, "**/Thing", f => f.replaceAll("A", "alpha"))
            .then(_ => {
                assert(p.findFileSync("Thing").getContentSync() === "alpha");
            })
            .then(done, done);
    });

    it.skip("replaces regex across project", done => {
        const p = tempProject();
        p.addFileSync("Thing", "A");
        p.addFileSync("config/Thing", "B");
        doWithFiles(p, "**/Thing", f => f.replace(/A-Z/, "alpha"))
            .then(_ => {
                assert(p.findFileSync("Thing").getContentSync() === "alpha");
            })
            .then(done, done);
    });

});
