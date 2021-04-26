import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-expiration',
  templateUrl: './expiration.component.html',
  styleUrls: ['./expiration.component.scss']
})
export class ExpirationComponent implements OnInit {

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  now :any = new Date();

  constructor(
  public dialogRef: MatDialogRef<ExpirationComponent>) { }

  ngOnInit() {
    this.now.setDate(this.now.getDate() + 1);
    this.now = this.now.toISOString();
    this.range.patchValue(
      {
        start:new Date().toISOString(),
      }
    )
  }

  applyDate(){
    this.dialogRef.close(this.range.value.start);
  }

}
