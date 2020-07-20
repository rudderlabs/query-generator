import React, { useRef } from "react";
import logo from "./logo.svg";
import { Provider } from "mobx-react";
import { Button, Row, Col, Card, Spin } from "antd";
import { stores } from "./app-stores/";
import "./App.less";
import { EventRow, IWhereClause } from "./components/eventrows";
import { EventGroup, IEventRowRef } from "./components/eventgroup";
import { UserGroup } from "./components/usergroup";
import { Input } from 'antd';
import fetchService from "./services/fetchservice";

const { TextArea } = Input;

export interface IAppState {
  sql: string
  fetchSql: boolean
}
export class App extends React.Component<any, IAppState> {
  eventGroupRef: React.RefObject<EventGroup>;
  userGroupRef: React.RefObject<UserGroup>;

  constructor(props: any) {
    super(props);
    this.state = {
      sql: '',
      fetchSql: false
    }
    this.eventGroupRef = React.createRef<EventGroup>();
    this.userGroupRef = React.createRef<UserGroup>();
  }

  fetchEventGroupState = () => {
    this.setState({fetchSql: true})
    let eventGroup: IEventRowRef[] = this.eventGroupRef.current!.fetchState();
    let userGroup:IWhereClause[] = this.userGroupRef.current!.fetchState()

    this.fetchSql(eventGroup,userGroup).then((res) => {
      let query: string[] = []
      Object.keys(res).forEach(table => {
        query.push(res[table])
      })
      console.log(query.join("\n"))
      this.setState({
        fetchSql: false,
        sql: query.join(";\n\n")
      })
    })
  };

  fetchSql = async (eventGroup:IEventRowRef[], userGroup: IWhereClause[]): Promise<any> => {
    let eventRows:any = [];
    eventGroup.map(eventRow => {
  
      let rowObj:any = {}, filters:any[] = [], groupBy: any[]= []
      rowObj['name'] = eventRow.rowState.eventSelected;
      eventRow.rowState.whereClauses.map(whereClause => {
        let filterObj: any = {}
        filterObj["field"] = whereClause.property
        filterObj["type"] = 'string'  // hardcoding it for now
        filterObj["operator"] = whereClause.compValue
        filterObj["target_value"] =  whereClause.propertyValue
        filters.push(filterObj)
      })

      eventRow.rowState.groupClauses.map(groupClause => {
        groupBy.push(groupClause.property);
      })

      rowObj['name'] = eventRow.rowState.eventSelected
      rowObj['filters'] = filters;
      rowObj['group_by'] = groupBy

      eventRows.push(rowObj)
    })

    let userRows: any = []
    userGroup.map(userRow => {
      let userRowObj: any = {}
      userRowObj["field"]= userRow.property
      userRowObj["type"] =  "string"
      userRowObj["operator"] = userRow.compValue
      userRowObj["target_value"] = userRow.propertyValue

      userRows.push(userRowObj)
    })

    let queryData: any = {}
    queryData["query"]= "event_segmentation"
    queryData["database"]= "rudder_webapp_data"
    queryData["schema"]= "rudderwebapp"
    queryData["events"] = [...eventRows]
    queryData["user_filter"] = [...userRows]

    return new Promise(resolve => {
      fetchService().post("/getquery", queryData).then((res) => {
              resolve(res.data)
          })
  })

  }

  render() {
    const {fetchSql} = this.state
    return (
      <>
        <div className="App">
          <Provider {...stores}>
            {/* <EventRow/> */}

            {/* <div className="site-card-wrapper"> */}
            <div >
              <Row>
                <Col span={12}>
                  <Card>
                    <EventGroup
                      ref={this.eventGroupRef}
                      eventStore={stores.eventStore}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <UserGroup ref={this.userGroupRef}/>
                  </Card>
                </Col>
              </Row>

              <Button
              type="default"
              shape="round"
              size= 'small'
              onClick={() => this.fetchEventGroupState()}
              >
                Get Sql
              </Button>

              <div>
              {fetchSql &&  <Spin size="small" />}
              <TextArea
               value={this.state.sql}
               placeholder="Query Generator Output"
                autoSize
               />
              </div>
            </div>
          </Provider>
        </div>
      </>
    );
  }
}

export default App;
