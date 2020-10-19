import React, { Component } from 'react';
import Layout from "../components/layout";

export default class Home extends Component {
	state = {
		data: [],
		rowsNumber: 3,
		colsNumber: 4,
		supply: [],
		demand: [],
		methods: [
			{
				label: "North-West Corner Method",
				value: "nw"
			},
			{
				label: "Row Minima Method",
				value: "rm"
			},
			{
				label: "Column Minima Method",
				value: "cm"
			}
		],
		selectedMethod: "nw",
		solving: false,
		totalCost: 0,
		step: 0,
		stepByStep: false,
		finished: false
	}

	constructor(props) {
		super(props);
		this.solveProblem = this.solveProblem.bind(this);
	} 

	componentDidMount(){
		this.init();
	}

	init = function(reset){
		const rowsNumber = reset ? 3 : this.state.rowsNumber;
		const colsNumber = reset ? 4 : this.state.colsNumber;
		const data = [];
		const supply = [];
		const demand = [];
		for(let i=0; i<rowsNumber; i++){
			data.push([]);
			for(let j=0; j<colsNumber; j++){
				data[i].push({
					cost: 0,
					sum: null,
					sign: null,
					base: null,
					finished: false
				})
				if(i == 0) demand.push(0);
			}
			supply.push(0);
		}
		
		this.setState({data, supply, demand, rowsNumber, colsNumber});
	}

	addRow = function(supplyValue = 0, callback){
		const newData = [...this.state.data];
		const supply = [...this.state.supply];
		newData.push([]);
		for(let i=0; i<this.state.colsNumber; i++){
			newData[newData.length - 1].push({
				cost: 0,
				sum: null,
				sign: null,
				base: null,
				finished: false
			})
		}
		supply.push(supplyValue);

		this.setState({data: newData, rowsNumber: this.state.rowsNumber + 1, supply}, () => {
			if(callback) callback();
		});
	}

	addColumn = function(demandValue = 0, callback){
		const newData = [...this.state.data];
		const demand = [...this.state.demand];
		for(let i=0; i<newData.length; i++){
			newData[i].push({
				cost: 0,
				sum: null,
				sign: null,
				base: null,
				finished: false
			})
		}
		demand.push(demandValue);

		this.setState({data: newData, colsNumber: this.state.colsNumber + 1, demand}, () => {
			if(callback) callback();
		});
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
		supply[row] = parseInt(e.target.value);

		this.setState({supply});
	}

	changeDemand = function(e, column){
		const demand = [...this.state.demand];
		demand[column] = parseInt(e.target.value);

		this.setState({demand});
	}

	changeMethod = function(e){
		const selectedMethod = e.target.value;
		this.setState({selectedMethod});
	}

	solve = function(data, supply, demand, step){
		let totalCost = this.state.totalCost;
		switch(this.state.selectedMethod){
			case "nw":
				if(this.state.stepByStep && step == data.length){
					this.setState({step: 0, finished: true});
					return;
				}
				for(let i=step; i<data.length; i++){
					let min = 0;

					// search min from supply and demand
					for(let j=0; j<data[i].length; j++){
						if(!data[i][j].finished){
							if(supply[i] > demand[j]){
								min = demand[j];
								supply[i] -= min;
								demand[j] = 0;
							}
							else if(demand[j] > supply[i]){
								min = supply[i];
								demand[j] -= min;
								supply[i] = 0;
							}
							else{
								min = supply[i];
								supply[i] = 0;
								demand[j] = 0;
							}
							data[i][j].base = min;
							data[i][j].finished = true;
							totalCost += (data[i][j].cost * data[i][j].base);
						}
					}

					if(this.state.stepByStep){
						step = step + 1;
						if(step == data.length){
							this.setState({step: 0, finished: true});
							break;
						}
						else this.setState({step})
						break;
					}
				}
				break;
			
			case "rm":
				const repeatSolveRM = (data, supply, demand, step) => {
					if(this.state.stepByStep && step == data.length){
						this.setState({step: 0, finished: true});
						return;
					}
					for(let i=step; i<data.length; i++){
						let min = 0;
						let minCost = Number.MAX_SAFE_INTEGER;
						let minCostIndex = 0;
	
						// search min cost element on row then get it and its index
						for(let j=0; j<data[i].length; j++){
							if(!data[i][j].finished){
								if(minCost > data[i][j].cost){
									minCost = data[i][j].cost;
									minCostIndex = j;
								}
								else if(minCost == data[i][j].cost && data[i][j].base == null){
									minCost = data[i][j].cost;
									minCostIndex = j;
								}
							}
						}

						if(!data[i][minCostIndex].finished){
							if(supply[i] > demand[minCostIndex]){
								min = demand[minCostIndex];
								supply[i] -= min;
								demand[minCostIndex] = 0;
							}
							else if(demand[minCostIndex] > supply[i]){
								min = supply[i];
								demand[minCostIndex] -= min;
								supply[i] = 0;
							}
							else{
								min = supply[i];
								supply[i] = 0;
								demand[minCostIndex] = 0;
							}
							data[i][minCostIndex].base = min;
							data[i][minCostIndex].finished = true;
							totalCost += (data[i][minCostIndex].cost * data[i][minCostIndex].base);
							if(supply[i] != 0) repeatSolveRM(data, supply, demand, step);
						}

						if(this.state.stepByStep){
							step = step + 1;
							if(step == data.length){
								this.setState({step: 0, finished: true});
								return;
							}
							else this.setState({step})
							return;
						}
					}
				}

				repeatSolveRM(data, supply, demand, step);
				break;

			case "cm":
				const repeatSolveCM = (data, supply, demand, step) => {
					if(this.state.stepByStep && step == this.state.colsNumber){
						this.setState({step: 0, finished: true});
						return;
					}
					for(let i=step; i<this.state.colsNumber; i++){
						let min = 0;
						let minCost = Number.MAX_SAFE_INTEGER;
						let minCostIndex = 0;
	
						// search min cost element on column then get it and its index
						for(let j=0; j<data.length; j++){
							if(!data[j][i].finished){
								if(minCost > data[j][i].cost){
									minCost = data[j][i].cost;
									minCostIndex = j;
								}
								else if(minCost == data[j][i].cost && data[j][i].base == null){
									minCost = data[j][i].cost;
									minCostIndex = j;
								}
							}
						}

						if(!data[minCostIndex][i].finished){
							if(supply[minCostIndex] > demand[i]){
								min = demand[i];
								supply[minCostIndex] -= min;
								demand[i] = 0;
							}
							else if(demand[i] > supply[minCostIndex]){
								min = supply[minCostIndex];
								demand[i] -= min;
								supply[minCostIndex] = 0;
							}
							else{
								min = supply[minCostIndex];
								supply[minCostIndex] = 0;
								demand[i] = 0;
							}
							data[minCostIndex][i].base = min;
							data[minCostIndex][i].finished = true;
							totalCost += (data[minCostIndex][i].cost * data[minCostIndex][i].base);
							if(demand[i] != 0) repeatSolveCM(data, supply, demand, step);
						}

						if(this.state.stepByStep){
							step = step + 1;
							if(step == this.state.colsNumber){
								this.setState({step: 0, finished: true});
								return;
							}
							else this.setState({step})
							return;
						}
					}
				}

				repeatSolveCM(data, supply, demand, step);
				break;
		}

		this.setState({data, supply, demand, totalCost});
	}

	solveProblem = function(){
		if(!this.state.solving) this.setState({solving: true});
		const data = [...this.state.data];
		const supply = [...this.state.supply];
		const demand = [...this.state.demand];
		const step = this.state.step;

		const supplySum = supply.reduce((total, num) => parseInt(total) + parseInt(num));
		const demandSum = demand.reduce((total, num) => parseInt(total) + parseInt(num));

		if(supplySum == 0 && demandSum == 0){
			alert("Problem cannot be solved! There is no supply and demand values!");
			this.setState({solving: false});
			return;
		}
		else if(supplySum > demandSum){
			this.addColumn(supplySum - demandSum, this.solveProblem);
		}
		else if(supplySum < demandSum){
			this.addRow(demandSum - supplySum, this.solveProblem);
		}
		else this.solve(data, supply, demand, step);
	}

	nextStep = function(){
		if(!this.state.solving) this.setState({solving: true});
		const data = [...this.state.data];
		const supply = [...this.state.supply];
		const demand = [...this.state.demand];
		const step = this.state.step;

		if(step == 0){
			const supplySum = supply.reduce((total, num) => parseInt(total) + parseInt(num));
			const demandSum = demand.reduce((total, num) => parseInt(total) + parseInt(num));

			if(supplySum == 0 && demandSum == 0){
				alert("Problem cannot be solved! There is no supply and demand values!");
				this.setState({solving: false});
				return;
			}
			else if(supplySum > demandSum){
				this.addColumn(supplySum - demandSum, this.solveProblem);
			}
			else if(supplySum < demandSum){
				this.addRow(demandSum - supplySum, this.solveProblem);
			}
			else this.solve(data, supply, demand, step);
		}
		else this.solve(data, supply, demand, step);
	}

	changeSolving = function(e){
		this.setState({stepByStep: e.target.checked});
	}

	resetProblem = function(){
		this.setState({solving: false, selectedMethod: "nw", stepByStep: false, step: 0, totalCost: 0, finished: false});
		this.init(true);
	}

	render(){
		return (
			<Layout className="home">
				<div className="w-75 mx-auto text-center" style={{paddingTop: "5vh"}}>
					<h1 style={{fontFamily: "Courier New"}}><strong>Transportation Problem Solver</strong></h1>
					<hr/>
					<div className="w-75 mx-auto">
						<div>
							{	
								!this.state.solving && <div className="form-group w-75 mx-auto mb-5">
									<label className="lead">Select a method</label>
									<select className="form-control sm" id="methodSelect" value={this.state.selectedMethod} onChange={e => this.changeMethod(e)}>
									{
										this.state.methods.map((item, index) => (
											<option key={index} value={item.value}>{item.label}</option>
										))
									}
									</select>
								</div>
							}
							{
								this.state.data.map((row, rowIndex) => (
									<div key={rowIndex} style={{display: "flex", overflowX: scroll}}>
										{!this.state.solving && rowIndex != 0 && <div className="mr-3 mt-3"><button className="btn btn-danger" onClick={() => this.removeRow(rowIndex)}><i className="fas fa-minus"></i></button></div>}
										{!this.state.solving && rowIndex == 0 && <div className="mr-3 mt-5"><button className="btn btn-danger mt-4" onClick={() => this.removeRow(rowIndex)}><i className="fas fa-minus"></i></button></div>}
										{
											row.map((col, colIndex) => (
												<div key={colIndex + Math.random()} className="column-container">
													{!this.state.solving && rowIndex == 0 && <div key={colIndex + Math.random()} className="mr-3 mb-3"><button className="btn btn-danger" onClick={() => this.removeColumn(colIndex)}><i className="fas fa-minus"></i></button></div>}
													
													<div className="cell-container" key={colIndex}>
														<div>
															<div className="cell-item cell-top-left"><input type="number" className="cell text-success" onChange={e => this.changeCellContent(e, rowIndex, colIndex)} value={col.cost} disabled={this.state.solving}></input></div>
															<div className="cell-item cell-bottom-left"><input type="text" className="cell" disabled value={col.sign || ''}></input></div>
															
														</div>
														<div>
															<div className="cell-item cell-top-right"><input type="number" className="cell" disabled value={col.sum || ''}></input></div>
															<div className="cell-item cell-bottom-right"><input type="number" className="cell text-primary" disabled value={col.base || 'X'}></input></div>
														</div>
													</div>

													{rowIndex == this.state.data.length - 1 && <div className="w-50 ml-4 mt-3"><input type="number" className="content-cell text-center" onChange={e => this.changeDemand(e, colIndex)} value={this.state.demand[colIndex]} disabled={this.state.solving}></input></div>}
												</div>
											))
										}
										<div>
											{rowIndex != 0 && <div className="mt-4 w-50"><input type="number" className="content-cell text-center" onChange={e => this.changeSupply(e, rowIndex)} value={this.state.supply[rowIndex]} disabled={this.state.solving}></input></div>}
											{rowIndex == 0 && !this.state.solving && <div className="mt-5 w-50"><input type="number" className="content-cell mt-4 text-center" onChange={e => this.changeSupply(e, rowIndex)} value={this.state.supply[rowIndex]} disabled={this.state.solving}></input></div>}
											{rowIndex == 0 && this.state.solving && <div className="mt-4 w-50"><input type="number" className="content-cell text-center" onChange={e => this.changeSupply(e, rowIndex)} value={this.state.supply[rowIndex]} disabled={this.state.solving}></input></div>}
										</div>
										{!this.state.solving && rowIndex == 0 && <div className="ml-3" style={{height: "40px"}}><button className="btn btn-primary" onClick={() => this.addColumn()}><i className="fas fa-plus"></i></button></div>}
										
									</div>
								))
							}
						</div>
						{
							!this.state.solving && <div className="text-left mt-3">
								<button className="btn btn-primary" onClick={() => this.addRow()}><i className="fas fa-plus"></i></button>
							</div>
						}
						{this.state.solving && <p className="font-weight-bold mt-5 mb-3">Total Cost: <span className="text-danger">{this.state.totalCost}</span></p>}
						<div>
							{!this.state.solving && 
								<div className="mt-3">
									<label className="lead">Step by Step</label>
									<input type="checkbox" className="form-control" onChange={e => this.changeSolving(e)} value={this.state.stepByStep}></input>
								</div>
							}
						</div>
						{!this.state.solving && !this.state.stepByStep && <button className="btn btn-success mt-5" onClick={() => this.solveProblem()}>Solve Problem <i className="fas fa-calculator"></i></button>}
						{this.state.stepByStep && !this.state.finished && <div><button className="btn btn-success mt-5" onClick={() => this.nextStep()}>Next Step <i className="fas fa-calculator"></i></button></div>}
						{this.state.solving && <div><button className="btn btn-success mt-5" onClick={() => this.resetProblem()}>Retake <i className="fas fa-redo"></i></button></div>}
					</div>
				</div>
			</Layout>
		)
	}
}
