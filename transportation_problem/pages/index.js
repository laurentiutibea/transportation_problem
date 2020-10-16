import React, { Component } from 'react';
import Layout from "../components/layout";

export default class Home extends Component {
	state = {
		data: [],
		rowsNumber: 3,
		colsNumber: 4,
		supply: [],
		demand: []
	}

	componentDidMount(){
		const data = [];
		const supply = [];
		const demand = [];
		for(let i=0; i<this.state.rowsNumber; i++){
			data.push([]);
			for(let j=0; j<this.state.colsNumber; j++){
				data[i].push({
					cost: null,
					sum: null,
					sign: null,
					base: null
				})
				demand.push(0);
			}
			supply.push(0);
		}
		
		this.setState({data, supply, demand});
	}

	addRow = function(){
		let newData = [...this.state.data];
		let supply = [...this.state.supply];
		newData.push([]);
		for(let i=0; i<this.state.colsNumber; i++){
			newData[newData.length - 1].push({
				cost: null,
				sum: null,
				sign: null,
				base: null
			})
		}
		supply.push(0);

		this.setState({data: newData, rowsNumber: this.state.rowsNumber + 1, supply});
	}

	addColumn = function(){
		let newData = [...this.state.data];
		let demand = [...this.state.demand];
		for(let i=0; i<newData.length; i++){
			newData[i].push({
				cost: null,
				sum: null,
				sign: null,
				base: null
			})
		}
		demand.push(0);

		this.setState({data: newData, colsNumber: this.state.colsNumber + 1});
	}

	removeColumn = function(columnIndex){
		let supply = [...this.state.supply];
		let demand = [...this.state.demand];
		let newData = [...this.state.data];
		let removeData = false;
		for(let i=0; i<newData.length; i++){
			newData[i] = newData[i].slice(0,columnIndex).concat(newData[i].slice(columnIndex+1, newData[i].length));
			if(newData[i].length == 0){
				removeData = true;
				break;
			}
		}

		demand = demand.slice(0,columnIndex).concat(demand.slice(columnIndex+1, demand.length));

		if(removeData){
			newData = [];
			supply = [];
			demand = [];
		}

		this.setState({data: newData, colsNumber: this.state.colsNumber - 1, supply, demand});
	}

	removeRow = function(rowIndex){
		let supply = [...this.state.supply];
		const bkData = [...this.state.data];
		const newData = bkData.slice(0,rowIndex).concat(bkData.slice(rowIndex+1, bkData.length));
		supply = supply.slice(0,rowIndex).concat(supply.slice(rowIndex+1, supply.length));

		this.setState({data: newData, rowsNumber: this.state.rowsNumber + 1, supply});
	}

	changeCellContent = function(e, row, column){
		const data = [...this.state.data];
		data[row][column].cost = e.target.value;

		this.setState({data});
	}

	changeSupply = function(e, row){
		const supply = [...this.state.supply];
		supply[row] = e.target.value;

		this.setState({supply});
	}

	changeDemand = function(e, column){
		const demand = [...this.state.demand];
		demand[column] = e.target.value;

		this.setState({demand});
	}

	render(){
		return (
			<Layout className="home">
				<div className="w-75 mx-auto text-center" style={{paddingTop: "10vh"}}>
					<h1 style={{fontFamily: "Courier New"}}><strong>Transportation Problem Solver</strong></h1>
					<hr/>
					<div className="w-75 mx-auto">
						<div>
							{
								this.state.data.map((row, rowIndex) => (
									<div key={rowIndex} style={{display: "flex", overflowX: scroll}}>
										{rowIndex != 0 && <div className="mr-3 mt-3"><button className="btn btn-danger" onClick={() => this.removeRow(rowIndex)}><i className="fas fa-minus"></i></button></div>}
										{rowIndex == 0 && <div className="mr-3 mt-5"><button className="btn btn-danger mt-4" onClick={() => this.removeRow(rowIndex)}><i className="fas fa-minus"></i></button></div>}
										{
											row.map((col, colIndex) => (
												<div key={colIndex + Math.random()} className="column-container">
													{rowIndex == 0 && <div key={colIndex + Math.random()} className="mr-3 mb-3"><button className="btn btn-danger" onClick={() => this.removeColumn(colIndex)}><i className="fas fa-minus"></i></button></div>}
													
													<div className="cell-container" key={colIndex}>
														<div>
															<div className="cell-item cell-top-left"><input type="number" className="cell" onChange={e => this.changeCellContent(e, rowIndex, colIndex)} value={col.cost || ''}></input></div>
															<div className="cell-item cell-bottom-left"><input type="text" className="cell" disabled value={col.sign || ''}></input></div>
															
														</div>
														<div>
															<div className="cell-item cell-top-right"><input type="number" className="cell" disabled value={col.sum || ''}></input></div>
															<div className="cell-item cell-bottom-right"><input type="number" className="cell" disabled value={col.base || ''}></input></div>
														</div>
													</div>

													{rowIndex == this.state.data.length - 1 && <div className="w-50 ml-4 mt-3"><input type="number" className="content-cell" onChange={e => this.changeDemand(e, colIndex)} value={this.state.demand[colIndex]}></input></div>}
												</div>
											))
										}
										<div>
											{rowIndex != 0 && <div className="mt-4 w-50"><input type="number" className="content-cell" onChange={e => this.changeSupply(e, rowIndex)} value={this.state.supply[rowIndex]}></input></div>}
											{rowIndex == 0 && <div className="mt-5 w-50"><input type="number" className="content-cell mt-4" onChange={e => this.changeSupply(e, rowIndex)} value={this.state.supply[rowIndex]}></input></div>}
										</div>
										{rowIndex == 0 && <div className="ml-3" style={{height: "40px"}}><button className="btn btn-primary" onClick={() => this.addColumn()}><i className="fas fa-plus"></i></button></div>}
										
									</div>
								))
							}
						</div>
						<div className="text-left mt-3">
							<button className="btn btn-primary" onClick={() => this.addRow()}><i className="fas fa-plus"></i></button>
						</div>
					</div>
				</div>
			</Layout>
		)
	}
}
