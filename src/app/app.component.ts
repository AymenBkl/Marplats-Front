import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  links: any[] = [];
  displayedColumns: string[] = ['link', 'createdAt', 'delete'];
  dataSource;
  expandedElement: any;
  @ViewChild(MatSort,{static:false}) sort: MatSort;
  @ViewChild(MatPaginator,{static:false}) paginator: MatPaginator;

  constructor(private httpClient: HttpClient){

  }
  ngOnInit(): void {
    this.getAllLinks();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  displayToast(msg:string,loading:boolean,type:string) {
    const Toast = Swal.mixin({
      toast: true,
      target: '#custom-target',
      position: 'bottom-start',
      showConfirmButton: false,
      className: "pos-toast-swt",
      background:this.handleSnackBar(type),
      didOpen: (toast) => {
        if (loading) Swal.showLoading();

      }
    })




    Toast.fire({
      icon: type,
      title: msg
    })
    if (!loading) {
      setTimeout(() => {
        Toast.close()
      },4000);
    }

  }

  private handleSnackBar(type: string): string {
    if (type == 'error'){
      return '#d9534f';
    }
    else if (type == 'success'){
      return '#5cb85c';
    }
    else if (type == 'warning'){
      return '#f0ad4e';
    }
    else if (type == 'info'){
      return '';
    }
    else {
      return '';
    }
  }

  async createLoading(msg?) {
    Swal.fire({
      title: 'Loading !',
      html: msg,// add html attribute if you want or remove
      allowOutsideClick: false,
      showConfirmButton: false,
      backdrop: false,
      allowEscapeKey: false,
      onBeforeOpen: () => {
          Swal.showLoading()
      },
  });
}

createInputSwal() {
  Swal.fire({
    title: 'Update Link',
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off',
      placeHolder:'ID OF SHEET'
    },
    showCancelButton: true,
    confirmButtonText: 'Update',
    showLoaderOnConfirm: true,
    timer: 1500000,
    preConfirm: (update) => {
      return this.addLink(update)
        .then(() => {

        })
        .catch(() => {

        })
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    console.log(result);
    if (result.isConfirmed) {
      Swal.fire({
        title:"LINK UPDATED",
        icon:'success',
      })
    }
    else if (result.isDismissed){
    }
  })

}

getAllLinks() {
  this.createLoading('Getting All Links Please Wait');
  this.httpClient.get(environment.url + 'markplats/getlinks')
    .subscribe((result:any) => {
      Swal.close();
      if (result && result.status == 200) {
        this.displayToast('Links Loaded',false,'success');
      }
      else if (result && result.status == 404) {
        this.displayToast('You have no links',false,'warning');
      }
      else {
        this.displayToast('SOMETHING WENT WRONG',false,'error');

      }
    },err => {
      Swal.close();
      this.displayToast('SOMETHING WENT WRONG',false,'error');

    })
}

addLink(link:String){
  return new Promise((resolve,reject) => {
    this.httpClient.post(environment.url + 'markplats/addlink',{link:link})
    .subscribe((result:any) => {
      if (result && result.status == 200) {
        this.displayToast('Link Created Succesfully',false,'success');
        resolve({status:true});
      }
      else {
        Swal.showValidationMessage(
          `Request failed: Something Went Wrong`
        )
      }
    },err => {
      Swal.showValidationMessage(
        `Request failed: Something Went Wrong`
      )
    })

  })


}

}
