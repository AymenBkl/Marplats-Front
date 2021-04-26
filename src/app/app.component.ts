import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ExpirationComponent } from './components/expiration/expiration.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  links: any[] = [];
  displayedColumns: string[] = ['link', 'createdAt', 'expiration', 'delete', 'uexpiration'];
  dataSource;
  expandedElement: any;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private httpClient: HttpClient,
              private dialog: MatDialog) {

  }
  ngOnInit(): void {
    this.getAllLinks();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  displayToast(msg: string, loading: boolean, type: string) {
    const Toast = Swal.mixin({
      toast: true,
      target: '#custom-target',
      position: 'bottom-start',
      showConfirmButton: false,
      background: this.handleSnackBar(type),
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
      }, 4000);
    }

  }

  private handleSnackBar(type: string): string {
    if (type == 'error') {
      return '#d9534f';
    }
    else if (type == 'success') {
      return '#5cb85c';
    }
    else if (type == 'warning') {
      return '#f0ad4e';
    }
    else if (type == 'info') {
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
        placeHolder: 'ID OF SHEET'
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
          title: "LINK ADDED SUCCESFULLY",
          icon: 'success',
        })
      }
      else if (result.isDismissed) {
      }
    })

  }

  getAllLinks() {
    this.createLoading('Getting All Links Please Wait');
    this.httpClient.get(environment.url + 'markplats/getlinks')
      .subscribe((result: any) => {
        Swal.close();
        if (result && result.status == 200) {
          this.displayToast('Links Loaded', false, 'success');
          this.links = result.links;
          this.dataSource = new MatTableDataSource(this.links);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
        else if (result && result.status == 404) {
          this.displayToast('You have no links', false, 'warning');
        }
        else {
          this.displayToast('SOMETHING WENT WRONG', false, 'error');

        }
      }, err => {
        Swal.close();
        this.displayToast('SOMETHING WENT WRONG', false, 'error');

      })
  }

  addLink(link: String) {
    return new Promise((resolve, reject) => {
      this.httpClient.post(environment.url + 'markplats/addlink', { link: link })
        .subscribe((result: any) => {
          console.log(result);
          if (result && result.status == 200) {
            this.links.push(result.link);
            this.dataSource = new MatTableDataSource(this.links);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            resolve({ status: true });
          }
          else {
            resolve({ status: false });
            Swal.showValidationMessage(
              `Request failed: ${result.msg}`
            )
          }
        }, err => {
          resolve({ status: false });
          Swal.showValidationMessage(
            `Request failed: ${err.msg}`
          )
        })

    })
  }

  confirmDeleteLink(linkId: string) {

    let msg = "Are You Sure !";
    let text = 'Delete Store';
    let icon = 'warning';
    let confirmBtn = 'Delete';
    let cancelBtn = 'Cancel';
    Swal.fire({
      title: msg,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmBtn,
      cancelButtonText: cancelBtn,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        return this.deleteLink(linkId)
          .then((result) => {
          })
          .catch(err => {
          })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value || result.isConfirmed) {
        Swal.fire({
          title: "STORE DELETED SUCCESFULLY",
          icon: 'success',
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  createDateSwal(linkId:string) {
    const dialogToOpen = this.dialog.open(ExpirationComponent, {
      width: '50%',
      height: '50%',
    });

    dialogToOpen.afterClosed().subscribe(date => {
      if (date && date != null) {
        this.updateExpiration(linkId,date);
      }
    })

  }

  deleteLink(linkId: string) {
    return new Promise((resolve, reject) => {

      this.httpClient.put(environment.url + 'markplats/deletelink', { link: linkId })
        .subscribe((result: any) => {
          console.log(result);
          if (result && result.status == 200) {
            const indexToRemove = this.links.findIndex(link => link.link == linkId);

            this.links.splice(indexToRemove, 1);
            this.dataSource = new MatTableDataSource(this.links);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator; resolve({ status: true });
          }
          else {
            resolve({ status: false });
            Swal.showValidationMessage(
              `Request failed: ${result.msg}`
            )
          }
        }, err => {
          resolve({ status: false });
          Swal.showValidationMessage(
            `Request failed: ${err.msg}`
          )
        })
    })
  }


  updateExpiration(linkId: string,newDate:Date) {
      this.displayToast('Updating Expiration Date',true,'info');
      this.httpClient.put(environment.url + 'markplats/updatexpiration', { storeId: linkId , date:newDate})
        .subscribe((result: any) => {
          Swal.close();
          console.log(result);
          if (result && result.status == 200) {
            this.displayToast('Expiration Date Updated Succesfully',true,'success');
            const indexToUpdate = this.links.findIndex(link => link._id == linkId);
            this.links[indexToUpdate] = result.link;
            this.dataSource = new MatTableDataSource(this.links);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          }
          else {
            this.displayToast('Something Went Wrong',true,'error');
          }
        }, err => {
          this.displayToast('Something Went Wrong',true,'error');
        })
  }

}
