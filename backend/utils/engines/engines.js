const {YTSEngine} = require('./yts')
const {ArchiveEngine} = require('./archive');


const AllEngines = async (options = {}) => {
    const yts = await YTSEngine(options);
    const archive = await ArchiveEngine(options);

    return {
        archive : archive,
        yts: yts
    };
   

};

module.exports = AllEngines;
