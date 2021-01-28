"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisMarkEnum = exports.AnalysisMarkName = exports.MergeMarkName = void 0;
exports.MergeMarkName = "x-merge-mark";
exports.AnalysisMarkName = "x-analysis-mark";
var AnalysisMarkEnum;
(function (AnalysisMarkEnum) {
    AnalysisMarkEnum["AllOf"] = "allOf";
    AnalysisMarkEnum["OneOf"] = "oneOf";
    AnalysisMarkEnum["AnyOf"] = "anyOf";
    AnalysisMarkEnum["Const"] = "const";
    AnalysisMarkEnum["Enum"] = "enum";
    AnalysisMarkEnum["Examples"] = "examples";
    AnalysisMarkEnum["Integer"] = "integer";
    AnalysisMarkEnum["Number"] = "number";
    AnalysisMarkEnum["String"] = "string";
    AnalysisMarkEnum["Object"] = "object";
    AnalysisMarkEnum["Array"] = "array";
})(AnalysisMarkEnum = exports.AnalysisMarkEnum || (exports.AnalysisMarkEnum = {}));
