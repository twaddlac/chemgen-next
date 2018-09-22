import {Router, ActivatedRoute, Params} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {AnalysisApi} from '../../../../sdk/services/custom';
import {Lightbox} from 'angular2-lightbox';
import {LoopBackConfig} from '../../../../sdk';
import {AnalysisResultSet} from '../../../../sdk/models';
import {JsonPipe} from '@angular/common';
import {isEqual, find, uniqBy, isNaN, isFinite} from 'lodash';

@Component({
  selector: 'app-gene',
  templateUrl: './gene.component.html',
  styleUrls: ['./gene.component.css']
})
export class GeneComponent implements OnInit {

  public results: AnalysisResultSet;
  public isDataAvailable: Boolean = false;
  public params: Params = {};

  constructor(private analysisApi: AnalysisApi,
              public _lightbox: Lightbox,
              private activatedRoute: ActivatedRoute) {
    // LoopBackConfig.setBaseURL('http://onyx.abudhabi.nyu.edu:3000');
    // LoopBackConfig.setApiVersion('api');
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.params = params;
      console.log(JSON.stringify(params));
    });
    this.getAnalysis()
      .then(() => {
        this.isDataAvailable = true;
      });
  }

  getAnalysis() {
    const code = this.params.code || 'mip1Mip2Chr1ProteomicsDownstreamAnalysis';
    const where = {code: code};
    return new Promise((resolve, reject) => {
      this.analysisApi.findOne({where: where})
        .toPromise()
        .then((results: AnalysisResultSet) => {
          this.results = results;
          return this.createAlbum();
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error));
        });
    });
  }

  createAlbum() {
    return new Promise((resolve, reject) => {
      // let resultsWithCounts = [];
      // let resultsNoCounts = [];
      const resultsWithCounts = this.results.results.filter((expSet) => {
        return isFinite(expSet.rank.maxDifference);
      });
      const resultsWithNoCounts = this.results.results.filter((expSet) => {
        return !isFinite(expSet.rank.maxDifference);
      });
      this.results.results = [];
      resultsWithCounts.map((r) => {
        this.results.results.push(r);
      });
      resultsWithNoCounts.map((r) => {
        this.results.results.push(r);
      });
      this.results.results.map((expSet) => {
        ['treat_rnai', 'ctrl_rnai', 'ctrl_null', 'ctrl_strain'].map((condition) => {
          const imagesPaths = expSet[`${condition}_image_paths`];
          //TODO Put onyx.abudhabi.nyu.edu
          let album = imagesPaths.map((imagePath) => {
            const counts = find(expSet[`${condition}_counts`], (counts) => {
              return isEqual(counts.assayImagePath, imagePath);
            }) || {};
            return {
              counts: counts,
              src: `http://onyx.abudhabi.nyu.edu/images/${imagePath}-autolevel.jpeg`,
              thumb: `http://onyx.abudhabi.nyu.edu/images/${imagePath}-autolevel-600x600.jpeg`,
            };
          });
          album = uniqBy(album, 'src');
          expSet[`${condition}_album`] = album;
        });
      });
      resolve();
    });
  }

  /**
   * open an image in a lightbox album by index
   * @param album
   * @param {number} index
   */
  open(album, index: number): void {
    this._lightbox.open(album, index);
  }

  removeElementFromArray(list: Array<any>, index: number) {
    if (index > -1) {
      list.splice(index, 1);
    }
  }

}
