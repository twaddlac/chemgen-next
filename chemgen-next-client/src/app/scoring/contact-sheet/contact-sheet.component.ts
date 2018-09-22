import {Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {ExpSetApi} from '../../../sdk/services/custom';
import {Lightbox} from 'angular2-lightbox';
import {NouisliderModule} from 'ng2-nouislider';
import {isArray, isObject, isUndefined, shuffle, isEqual, round, find, orderBy, minBy, maxBy, get} from 'lodash';
import {interpolateYlOrBr, interpolateViridis} from 'd3';
import {
  ExpAssayResultSet,
  ExpDesignResultSet, ExpManualScoresResultSet, ExpScreenResultSet, ExpScreenUploadWorkflowResultSet,
  ModelPredictedCountsResultSet
} from '../../../sdk/models';
import {ExpManualScoresApi} from '../../../sdk/services/custom';
import {ExpSetSearchResults} from '../expset/expset.module';


@Component({
  selector: 'app-contact-sheet',
  templateUrl: './contact-sheet.component.html',
  styleUrls: ['./contact-sheet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactSheetComponent implements OnInit {
  @Input('expSets') expSets: ExpSetSearchResults;
  @Output() expSetsScored = new EventEmitter<boolean>();

  public didScore = false;

  public errorMessage = '';
  public sliderValue: any = [50, 100];
  // public sliderStartValues = [50, 100];
  public contactSheetResults: ContactSheetFormResults = new ContactSheetFormResults();

  // TODO Pass this in from the search
  public phenotype = 'none';
  public sortOrder = 'desc';

  public displaySlider = false;
  public displayCounts = false;

  public filterPhenotypeOptions = [
    {
      code: 'none',
      display: 'None',
    },
    {
      code: 'percEmbLeth',
      display: '% Embryonic Lethality'
    },
    {
      code: 'percSter',
      display: '% Sterility',
    },
    {
      code: 'broodSize',
      display: 'Brood Size'
    },
    {
      code: 'wormCount',
      display: 'Worm Count'
    },
    {
      code: 'larvaCount',
      display: 'Larva Count',
    },
    {
      code: 'eggCount',
      display: 'Egg Count',
    },
    {
      code: 'treatmentGroupId',
      display: 'Exp Set'
    },
    {
      code: 'plateId',
      display: 'Plate ID'
    }
  ];

  public albums: any = {
    // RnaiI.3A1E_M
    treatReagent: [],
    //  RNAiI.3A1
    ctrlReagent: [],
    // L4440M
    ctrlStrain: [],
    // L4440
    ctrlNull: [],
    scoreThese: [],
    interestingReagent: [],
    interestingCtrl: [],
    removed: [],
    expSets: {},
  };


  public range: any;
  public interesting: any = {};
  public config: any;

  constructor(private expSetApi: ExpSetApi,
              private expManualScoresApi: ExpManualScoresApi,
              public _lightbox: Lightbox) {
  }

  ngOnInit() {
    this.config = {
      behaviour: 'drag',
      keyboard: true,
      step: 1,
      start: [50, 100],
      connect: true,
      margin: 1,
      range: {
        min: 0,
        max: 100
      },
      pips: {
        mode: 'count',
        density: 2,
        values: 6,
        stepped: true
      }
    };

    this.parseExpSetsToAlbums();
  }

  submitInteresting() {
    // DAMN TYPE CASTING
    const interestingTreatmentGroupIds: Array<any> = Object.keys(this.contactSheetResults.interesting).filter((treatmentGroupId: any) => {
      return this.contactSheetResults.interesting[treatmentGroupId];
    });
    const manualScores: ExpManualScoresResultSet[] = interestingTreatmentGroupIds.map((treatmentGroupId: any) => {
      const expAssay: any = find(this.albums.treatReagent, {treatmentGroupId: Number(treatmentGroupId)});
      const expScreen: any = find(this.expSets.expScreens, {screenId: Number(expAssay.screenId)});
      const manualScore: any = this.createManualScore(expScreen, 1, treatmentGroupId);
      return manualScore;
    });
    if (!isUndefined(manualScores) && isArray(manualScores)) {
      this.submitScores(manualScores)
        .then(() => {
          this.removeInteresting();
        })
        .catch((error) => {
          console.log(error);
          this.errorMessage = 'There was an error submitting interesting scores!';
        });
    }
  }

  submitAll() {
    const manualScores: ExpManualScoresResultSet[] = Object.keys(this.contactSheetResults.interesting).map((treatmentGroupId) => {
      let manualScoreValue = 0;
      if (this.contactSheetResults.interesting[treatmentGroupId]) {
        manualScoreValue = 1;
      }
      const expAssay: any = find(this.albums.treatReagent, {treatmentGroupId: Number(treatmentGroupId)});
      const expScreen: any = find(this.expSets.expScreens, {screenId: Number(expAssay.screenId)});
      const manualScore: any = this.createManualScore(expScreen, manualScoreValue, Number(treatmentGroupId));
      return manualScore;
    });
    this.submitScores(manualScores)
      .then(() => {
        this.didScore = true;
        this.expSetsScored.emit(true);
      })
      .catch((error) => {
        console.log(error);
        this.errorMessage = 'There was a problem submitting all scores!';
      });
  }

  createManualScore(expScreen: ExpScreenResultSet, manualScoreValue: number, treatmentGroupId: number) {
    return {
      'manualscoreGroup': 'FIRST_PASS',
      'manualscoreCode': 'FIRST_PASS_INTERESTING',
      'manualscoreValue': manualScoreValue,
      'screenId': expScreen.screenId,
      'screenName': expScreen.screenName,
      // 'assayId': null,
      'treatmentGroupId': treatmentGroupId,
      'scoreCodeId': 66,
      'scorerId': 1,
      // 'timestamp': Date.now(),
      // 'expWorkflowId': String(wellCounts.expWorkflowId),
    };
  }

  submitScores(manualScores) {
    return new Promise((resolve, reject) => {
      this.expManualScoresApi
        .submitScores(manualScores)
        .toPromise()
        .then((results) => {
          resolve();
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error));
        });
    });
  }

  removeInteresting() {
    Object.keys(this.contactSheetResults.interesting)
      .filter((treatmentGroupId) => {
        return this.contactSheetResults.interesting[treatmentGroupId];
      })
      .map((treatmentGroupId) => {
        this.removeByTreatmentGroupId(treatmentGroupId);
      });
  }

  removeByTreatmentGroupId(treatmentGroupId) {
    ['treatReagent', 'ctrlReagent'].map((albumName) => {
      const album = this.albums[albumName].filter((imageMeta, index) => {
        return !isEqual(Number(imageMeta.treatmentGroupId), Number(treatmentGroupId));
      });
      this.albums[albumName] = album;
    });
    const uninterestingKeys = Object.keys(this.contactSheetResults.interesting).filter((key) => {
      return !this.contactSheetResults.interesting[key];
    });
    this.contactSheetResults.interesting = {};
    uninterestingKeys.map((key) => {
      this.contactSheetResults.interesting[key] = false;
    });
  }

  sliderChanged() {
    const seenTreatmentGroup = {};
    ['treatReagent', 'ctrlReagent'].map((albumName) => {
      this.albums[albumName].map((imageMeta: any) => {

        if (!get(seenTreatmentGroup, imageMeta.treatmentGroupId)) {
          if (Number(imageMeta[this.phenotype]) >= this.sliderValue[0] && Number(imageMeta[this.phenotype]) <= this.sliderValue[1]) {
            this.contactSheetResults.interesting[imageMeta.treatmentGroupId] = true;
            seenTreatmentGroup[imageMeta.treatmentGroupId] = true;
          } else {
            this.contactSheetResults.interesting[imageMeta.treatmentGroupId] = false;
          }
        }
      });
    });
  }

  checkForTreatment(wellCounts: ModelPredictedCountsResultSet) {
    if (wellCounts.expGroupType.match('treat')) {
      return true;
    } else if (isEqual(wellCounts.expGroupType, 'ctrl_rnai')) {
      return true;
    } else if (isEqual(wellCounts.expGroupType, 'ctrl_chemical') || isEqual(wellCounts.expGroupType, 'ctrl_compound')) {
      return true;
    } else {
      return false;
    }
  }

  humanReadablePhenotype() {
    const pheno = find(this.filterPhenotypeOptions, {'code': this.phenotype});
    return pheno.display;
  }

  phenotypeChanged() {
    if (isEqual(this.phenotype, 'none')) {
      this.displaySlider = false;
      ['treatReagent', 'ctrlReagent'].map((albumName) => {
        if (get(this.albums, albumName)) {
          this.albums[albumName] = orderBy(this.albums[albumName], ['plateId', 'imagePath'], ['asc', 'asc']);
        }
      });
    } else {
      this.displaySlider = true;
      if (get(this.albums, 'treatReagent') && get(this.albums, 'ctrlReagent')) {
        let minTreat = 0;
        let maxTreat = 100;
        let minCtrl = 0;
        let maxCtrl = 0;
        const tmaxTreat = maxBy(this.albums.treatReagent, this.phenotype);
        if (isObject(maxTreat) && get(maxTreat, this.phenotype)) {
          maxTreat = tmaxTreat[this.phenotype];
        }
        const tminTreat = minBy(this.albums.treatReagent, this.phenotype);
        if (isObject(minTreat) && get(minTreat, this.phenotype)) {
          minTreat = tminTreat[this.phenotype];
        }
        const tminCtrl = minBy(this.albums.ctrlReagent, this.phenotype);
        if (isObject(minCtrl) && get(minCtrl, this.phenotype)) {
          minCtrl = tminCtrl[this.phenotype];
        }
        const tmaxCtrl = maxBy(this.albums.ctrlReagent, this.phenotype);
        if (isObject(maxCtrl) && get(maxCtrl, this.phenotype)) {
          maxCtrl = tmaxCtrl[this.phenotype];
        }

        this.config.range.min = Math.min(minTreat, minCtrl) - 1;
        this.config.range.max = Math.max(maxCtrl, maxTreat) + 1;

        this.config.start[0] = this.config.range.min;
        this.config.start[1] = this.config.range.max;
      }
      ['treatReagent', 'ctrlReagent'].map((albumName) => {
        if (get(this.albums, albumName)) {
          this.albums[albumName] = orderBy(this.albums[albumName], this.phenotype, this.sortOrder);
        }
      });
    }
  }

  getAlbumName(expGroupType: string) {
    let albumName = null;
    if (!expGroupType) {
      return null;
    } else if (isEqual(expGroupType, 'treatReagent')) {
      albumName = 'treatReagent';
    } else if (isEqual(expGroupType, 'treat_rnai') || isEqual(expGroupType, 'treat_compound')) {
      albumName = 'treatReagent';
    } else if (isEqual(expGroupType, 'treat_chemical')) {
      albumName = 'treatReagent';
    } else if (isEqual(expGroupType, 'ctrl_chemical')) {
      albumName = 'ctrlReagent';
    } else if (isEqual(expGroupType, 'ctrl_rnai') || isEqual(expGroupType, 'ctrl_chemical')) {
      albumName = 'ctrlReagent';
    } else if (isEqual(expGroupType, 'ctrl_null')) {
      albumName = 'ctrlNull';
    } else if (isEqual(expGroupType, 'ctrl_strain')) {
      albumName = 'ctrlStrain';
    }
    return albumName;
  }

  insertCountsData(wellCounts: ModelPredictedCountsResultSet) {
    if (isObject(wellCounts)) {
      return {
        percEmbLeth: Number(round(wellCounts.percEmbLeth, 3)),
        broodSize: Number(round(wellCounts.broodSize, 3)),
        percSter: Number(round(wellCounts.percSter, 3)),
        // Just counts
        wormCount: Number(wellCounts.wormCount),
        larvaCount: Number(wellCounts.larvaCount),
        eggCount: Number(wellCounts.eggCount),
        // Colorize all the things!
        percEmbLethColor: String(interpolateYlOrBr(wellCounts.percEmbLeth / 100)),
        percSteColor: String(interpolateYlOrBr(wellCounts.percSter / 100)),
        percSurvivalColor: String(interpolateYlOrBr(wellCounts.broodSize / 100)),
      };
    } else {
      return {
        percEmbLeth: null,
        broodSize: null,
        percSter: null,
        // Just counts
        wormCount: null,
        larvaCount: null,
        eggCount: null,
        // Colorize all the things!
        percEmbLethColor: null,
        percSteColor: null,
        percSurvivalColor: null,

      };
    }
  }

  parseExpSetsToAlbums() {
    this.expSets.expAssays.map((expAssay: ExpAssayResultSet) => {
      // const expAssay2reagent = find(this.expSets.results.expAssay2reagents, {assayId: expAssay.assayId});
      const wellCounts: ModelPredictedCountsResultSet = find(this.expSets.modelPredictedCounts, {assayId: expAssay.assayId});
      const expSet = this.getExpSet(expAssay);
      const albumName = this.getAlbumName(expSet.expGroupType);
      if (albumName) {
        const imageMeta: any = {
          screenId: expAssay.screenId,
          src: `http://onyx.abudhabi.nyu.edu/images/${expAssay.assayImagePath}-autolevel.jpeg`,
          thumb: `http://onyx.abudhabi.nyu.edu/images/${expAssay.assayImagePath}-autolevel-300x300.jpeg`,
          caption: `Image ${expAssay.assayImagePath} caption here`,
          imagePath: expAssay.assayImagePath,
          expWorkflowId: expAssay.expWorkflowId,
          expSet: expSet,
          treatmentGroupId: Number(expSet.treatmentGroupId),
          plateId: expAssay.plateId,
          assayId: expAssay.assayId,
          counts: wellCounts || {},
        };
        const countsData = this.insertCountsData(wellCounts);
        Object.keys(countsData).map((key) => {
          imageMeta[key] = countsData[key];
        });
        this.albums[albumName].push(imageMeta);
        if (expSet.treatmentGroupId) {
          this.contactSheetResults.interesting[expSet.treatmentGroupId] = false;
        }
      }
    });
    this.phenotypeChanged();

  }

  reset() {
    Object.keys(this.contactSheetResults.interesting).map((treatmentGroupId) => {
      this.contactSheetResults.interesting[treatmentGroupId] = false;
    });
  }

  getExpSet(expAssay: ExpAssayResultSet) {
    const o: any = {};

    let treatmentGroupId = null;

    // Memoize
    o.expWorkflow = find(this.expSets.expWorkflows, (expWorkflow: ExpScreenUploadWorkflowResultSet) => {
      return isEqual(expAssay.expWorkflowId, expWorkflow.id);
    });
    // Memoize
    o.expScreen = find(this.expSets.expScreens, (screen: ExpScreenResultSet) => {
      return isEqual(expAssay.screenId, screen.screenId);
    });

    // TODO Add treatmentGroupId to expAssay table
    // This should not happen once the denormalzing process is done
    const expSet = this.expSets.expSets.filter((texpSet: Array<ExpDesignResultSet>) => {
      return texpSet.filter((expDesignRow: ExpDesignResultSet) => {
        return isEqual(expAssay.expGroupId, expDesignRow.treatmentGroupId) || isEqual(expAssay.expGroupId, expDesignRow.controlGroupId);
      })[0];
    })[0];

    // From here down this can all be memoized
    if (expSet) {
      treatmentGroupId = expSet[0].treatmentGroupId;
      o.treatmentGroupId = Number(treatmentGroupId);
      o.expSets = expSet;
      const expDesignRow: ExpDesignResultSet = find(expSet, (expDesign: ExpDesignResultSet) => {
        return isEqual(expDesign.treatmentGroupId, expAssay.expGroupId) || isEqual(expDesign.controlGroupId, expAssay.expGroupId);
      });
      if (isEqual(expAssay.expGroupId, expDesignRow.treatmentGroupId)) {
        o.expGroupType = 'treatReagent';
      } else {
        o.expGroupType = expDesignRow.controlGroupReagentType;
      }
    }

    if (treatmentGroupId) {
      o.modelPredictedCounts = this.expSets.modelPredictedCounts.filter((counts: ModelPredictedCountsResultSet) => {
        return isEqual(counts.treatmentGroupId, treatmentGroupId);
      });

      o.albums = this.expSets.albums.filter((album: any) => {
        return isEqual(treatmentGroupId, album.treatmentGroupId);
      })[0];
    } else {
      // This should never happen....
      o.modelPredictedCounts = [];
      o.expSets = [];
      o.albums = {};
    }
    ['ctrlNullImages', 'ctrlStrainImages'].map((ctrlKey) => {
      if (get(o.albums, ctrlKey)) {
        o.albums[ctrlKey] = shuffle(o.albums[ctrlKey]).slice(0, 4);
      }
    });

    // To Do Add Reagents List

    return o;
  }

  parseInterestingToAlbumListener($event: string) {

  }

  getExpSetsListener($event: any) {
    
  }
}

class ContactSheetFormResults {
  interesting: any = {};
}
