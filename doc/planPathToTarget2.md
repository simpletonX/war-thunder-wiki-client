[失败] src/utils/planPathToTarget2.js -> 计算到达某个载具的最短路径（自动规划）

```js
/**
 * 规划到目标载具的最短路径
 */
export function planPathToTarget2({
  tree_data,
  target_data_unit_id,
  preset_data_unit_ids = [],
  instantCaching,
  t_c,
  type,
}) {
  const treeData = tree_data;
  
  // 1. 重置所有选中状态
  resetAllSelections(treeData);
  
  // 2. 找到目标载具的位置
  const targetInfo = findVehiclePosition(treeData, target_data_unit_id);
  if (!targetInfo) {
    console.error('目标载具未找到:', target_data_unit_id);
    return;
  }
  
  // 3. 构建选中集合
  const selectedVehicles = new Map(); // key: data_unit_id, value: vehicle info
  const selectedColumns = new Set(); // 记录已选中的列 "rankIndex-columnIndex"
  
  // 4. 选中目标载具所在列的完整依赖链
  if (!targetInfo.isPremium) {
    selectColumnChain(treeData, targetInfo.rankIndex, targetInfo.columnIndex, targetInfo.itemIndex, targetInfo.isGroup, targetInfo.subItemIndex, selectedVehicles, selectedColumns);
  }
  
  // 5. 选中preset高级载具
  selectPresetPremiumVehicles(treeData, preset_data_unit_ids, selectedVehicles);
  
  // 6. 检查并补充unlock_quantity (从低rank到高rank)
  fillUnlockQuantityOptimized(treeData, targetInfo.rankIndex, selectedVehicles, selectedColumns);
  
  // 7. 应用选中状态到tree_data
  applySelections(treeData, selectedVehicles);
  
  // 8. 更新每个rank的selected字段
  updateRankSelected(treeData);
  
  // 9. 执行回调
  instantCaching(treeData, t_c, type);
}

/**
 * 重置所有选中状态
 */
function resetAllSelections(treeData) {
  treeData.forEach(rank => {
    rank.selected = [];
    
    // 重置普通载具
    rank.researchable_vehicles.forEach(column => {
      column.forEach(item => {
        if (item.type === 'single') {
          item.selected = false;
        } else if (item.type === 'multiple') {
          item.selected = false;
          item.items.forEach(subItem => {
            subItem.selected = false;
          });
        }
      });
    });
    
    // 重置高级载具
    if (rank.premium_vehicles) {
      rank.premium_vehicles.forEach(column => {
        column.forEach(item => {
          if (item.type === 'single') {
            item.selected = false;
          } else if (item.type === 'multiple') {
            item.selected = false;
            item.items.forEach(subItem => {
              subItem.selected = false;
            });
          }
        });
      });
    }
  });
}

/**
 * 查找载具位置
 */
function findVehiclePosition(treeData, dataUnitId) {
  for (let rankIndex = 0; rankIndex < treeData.length; rankIndex++) {
    const rank = treeData[rankIndex];
    
    // 在普通载具中查找
    for (let columnIndex = 0; columnIndex < rank.researchable_vehicles.length; columnIndex++) {
      const column = rank.researchable_vehicles[columnIndex];
      for (let itemIndex = 0; itemIndex < column.length; itemIndex++) {
        const item = column[itemIndex];
        
        if (item.type === 'single' && item.data_unit_id === dataUnitId) {
          return { rankIndex, columnIndex, itemIndex, isGroup: false, isPremium: false };
        } else if (item.type === 'multiple') {
          const subItemIndex = item.items.findIndex(sub => sub.data_unit_id === dataUnitId);
          if (subItemIndex !== -1) {
            return { rankIndex, columnIndex, itemIndex, subItemIndex, isGroup: true, isPremium: false };
          }
        }
      }
    }
    
    // 在高级载具中查找
    if (rank.premium_vehicles) {
      for (let columnIndex = 0; columnIndex < rank.premium_vehicles.length; columnIndex++) {
        const column = rank.premium_vehicles[columnIndex];
        for (let itemIndex = 0; itemIndex < column.length; itemIndex++) {
          const item = column[itemIndex];
          
          if (item.type === 'single' && item.data_unit_id === dataUnitId) {
            return { rankIndex, columnIndex, itemIndex, isGroup: false, isPremium: true };
          } else if (item.type === 'multiple') {
            const subItemIndex = item.items.findIndex(sub => sub.data_unit_id === dataUnitId);
            if (subItemIndex !== -1) {
              return { rankIndex, columnIndex, itemIndex, subItemIndex, isGroup: true, isPremium: true };
            }
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * 选中整列的依赖链(从rank 0到目标位置)
 * @param targetItemIndex - 目标载具在该列中的位置
 * @param targetSubItemIndex - 如果目标在组内，这是组内索引
 */
function selectColumnChain(treeData, targetRankIndex, columnIndex, targetItemIndex, isTargetGroup, targetSubItemIndex, selectedVehicles, selectedColumns) {
  // 从rank 0遍历到目标rank
  for (let rankIndex = 0; rankIndex <= targetRankIndex; rankIndex++) {
    const rank = treeData[rankIndex];
    const column = rank.researchable_vehicles[columnIndex];
    
    if (!column || column.length === 0) continue;
    
    // 标记该列已被选中
    selectedColumns.add(`${rankIndex}-${columnIndex}`);
    
    if (rankIndex < targetRankIndex) {
      // 非目标rank：选中该列所有载具
      column.forEach((item, itemIndex) => {
        if (item.type === 'single') {
          addToSelected(selectedVehicles, item.data_unit_id, rankIndex, columnIndex, itemIndex, false, null, item.rp, item.sp);
        } else if (item.type === 'multiple') {
          // 对于multiple，只选择第一个item
          const firstItem = item.items[0];
          addToSelected(selectedVehicles, firstItem.data_unit_id, rankIndex, columnIndex, itemIndex, true, 0, firstItem.rp, firstItem.sp);
        }
      });
    } else {
      // 目标rank：选中到目标载具为止
      for (let itemIndex = 0; itemIndex <= targetItemIndex; itemIndex++) {
        const item = column[itemIndex];
        
        if (itemIndex < targetItemIndex) {
          // 目标之前的item：全部选中
          if (item.type === 'single') {
            addToSelected(selectedVehicles, item.data_unit_id, rankIndex, columnIndex, itemIndex, false, null, item.rp, item.sp);
          } else if (item.type === 'multiple') {
            // 只选第一个
            const firstItem = item.items[0];
            addToSelected(selectedVehicles, firstItem.data_unit_id, rankIndex, columnIndex, itemIndex, true, 0, firstItem.rp, firstItem.sp);
          }
        } else {
          // 目标item
          if (item.type === 'single') {
            addToSelected(selectedVehicles, item.data_unit_id, rankIndex, columnIndex, itemIndex, false, null, item.rp, item.sp);
          } else if (item.type === 'multiple') {
            // 如果目标在组内，只选第一个到目标的item
            const endIndex = isTargetGroup ? targetSubItemIndex : 0;
            for (let subIdx = 0; subIdx <= endIndex; subIdx++) {
              const subItem = item.items[subIdx];
              addToSelected(selectedVehicles, subItem.data_unit_id, rankIndex, columnIndex, itemIndex, true, subIdx, subItem.rp, subItem.sp);
            }
          }
        }
      }
    }
  }
}

/**
 * 选中preset高级载具
 */
function selectPresetPremiumVehicles(treeData, presetIds, selectedVehicles) {
  presetIds.forEach(presetId => {
    const info = findVehiclePosition(treeData, presetId);
    if (info && info.isPremium) {
      const rank = treeData[info.rankIndex];
      const column = rank.premium_vehicles[info.columnIndex];
      const item = column[info.itemIndex];
      item.selected = true
      
      // if (info.isGroup) {
      //   const subItem = item.items[info.subItemIndex];
      //   addToSelected(selectedVehicles, subItem.data_unit_id, info.rankIndex, info.columnIndex, info.itemIndex, true, info.subItemIndex, subItem.rp, subItem.sp);
      // } else {
      //   addToSelected(selectedVehicles, item.data_unit_id, info.rankIndex, info.columnIndex, info.itemIndex, false, null, item.rp, item.sp);
      // }
    }
  });
}

/**
 * 优化的填充unlock_quantity
 */
function fillUnlockQuantityOptimized(treeData, targetRankIndex, selectedVehicles, selectedColumns) {
  for (let rankIndex = 0; rankIndex <= targetRankIndex; rankIndex++) {
    const rank = treeData[rankIndex];
    const unlockQuantity = rank.unlock_quantity || 0;
    
    // 统计当前rank已选中的载具数量
    let currentCount = countSelectedInRank(selectedVehicles, rankIndex);
    
    // 如果数量不足，需要补充
    while (currentCount < unlockQuantity) {
      const needed = unlockQuantity - currentCount;
      
      // 策略1: 优先从已选中列的multiple组中选择未选中的items
      const addedFromGroups = fillFromExistingGroups(treeData, rankIndex, selectedVehicles, selectedColumns, needed);
      currentCount += addedFromGroups;
      
      if (currentCount >= unlockQuantity) break;
      
      // 策略2: 选择新的列（选择成本最低的列）
      const addedFromNewColumn = fillFromNewColumn(treeData, rankIndex, selectedVehicles, selectedColumns);
      if (addedFromNewColumn === 0) {
        // 没有更多载具可选
        console.warn(`Rank ${rankIndex} 无法满足unlock_quantity=${unlockQuantity}, 当前=${currentCount}`);
        break;
      }
      currentCount += addedFromNewColumn;
    }
  }
}

/**
 * 从已选中列的multiple组中填充
 */
function fillFromExistingGroups(treeData, rankIndex, selectedVehicles, selectedColumns, needed) {
  const rank = treeData[rankIndex];
  const candidates = [];
  
  // 遍历已选中的列，找出multiple组中未选中的items
  rank.researchable_vehicles.forEach((column, columnIndex) => {
    const columnKey = `${rankIndex}-${columnIndex}`;
    if (!selectedColumns.has(columnKey)) return;
    
    column.forEach((item, itemIndex) => {
      if (item.type === 'multiple') {
        item.items.forEach((subItem, subIdx) => {
          if (!selectedVehicles.has(subItem.data_unit_id)) {
            candidates.push({
              dataUnitId: subItem.data_unit_id,
              columnIndex,
              itemIndex,
              subItemIndex: subIdx,
              rp: subItem.rp === -1 ? 999999 : subItem.rp,
              sp: subItem.sp === -1 ? 999999 : subItem.sp,
              cost: (subItem.rp === -1 ? 999999 : subItem.rp) + (subItem.sp === -1 ? 999999 : subItem.sp) * 0.001,
              isFromGroup: true
            });
          }
        });
      }
    });
  });
  
  // 按成本排序
  candidates.sort((a, b) => a.cost - b.cost);
  
  // 选择needed个
  let added = 0;
  for (let i = 0; i < Math.min(needed, candidates.length); i++) {
    const candidate = candidates[i];
    addToSelected(
      selectedVehicles,
      candidate.dataUnitId,
      rankIndex,
      candidate.columnIndex,
      candidate.itemIndex,
      true,
      candidate.subItemIndex,
      candidate.rp,
      candidate.sp
    );
    added++;
  }
  
  return added;
}

/**
 * 从新列中填充（选择成本最低的列，并选中该列所有前置载具）
 */
function fillFromNewColumn(treeData, rankIndex, selectedVehicles, selectedColumns) {
  const rank = treeData[rankIndex];
  const columnCandidates = [];
  
  // 评估每个未选中的列
  rank.researchable_vehicles.forEach((column, columnIndex) => {
    const columnKey = `${rankIndex}-${columnIndex}`;
    if (selectedColumns.has(columnKey)) return;
    if (!column || column.length === 0) return;
    
    // 计算选中该列的总成本（包括该列在所有低rank中的前置载具）
    let totalCost = 0;
    let vehicleCount = 0;
    
    for (let r = 0; r <= rankIndex; r++) {
      const rRank = treeData[r];
      const rColumn = rRank.researchable_vehicles[columnIndex];
      
      if (!rColumn || rColumn.length === 0) continue;
      
      if (r < rankIndex) {
        // 低rank：计算整列成本
        rColumn.forEach(item => {
          if (item.type === 'single') {
            if (!selectedVehicles.has(item.data_unit_id)) {
              totalCost += (item.rp === -1 ? 999999 : item.rp) + (item.sp === -1 ? 999999 : item.sp) * 0.001;
              vehicleCount++;
            }
          } else if (item.type === 'multiple') {
            // 只算第一个
            const firstItem = item.items[0];
            if (!selectedVehicles.has(firstItem.data_unit_id)) {
              totalCost += (firstItem.rp === -1 ? 999999 : firstItem.rp) + (firstItem.sp === -1 ? 999999 : firstItem.sp) * 0.001;
              vehicleCount++;
            }
          }
        });
      } else {
        // 当前rank：只算第一个item
        const firstItem = rColumn[0];
        if (firstItem.type === 'single') {
          if (!selectedVehicles.has(firstItem.data_unit_id)) {
            totalCost += (firstItem.rp === -1 ? 999999 : firstItem.rp) + (firstItem.sp === -1 ? 999999 : firstItem.sp) * 0.001;
            vehicleCount++;
          }
        } else if (firstItem.type === 'multiple') {
          const subItem = firstItem.items[0];
          if (!selectedVehicles.has(subItem.data_unit_id)) {
            totalCost += (subItem.rp === -1 ? 999999 : subItem.rp) + (subItem.sp === -1 ? 999999 : subItem.sp) * 0.001;
            vehicleCount++;
          }
        }
      }
    }
    
    if (vehicleCount > 0) {
      columnCandidates.push({
        columnIndex,
        totalCost,
        vehicleCount,
        avgCost: totalCost / vehicleCount
      });
    }
  });
  
  if (columnCandidates.length === 0) return 0;
  
  // 选择平均成本最低的列
  columnCandidates.sort((a, b) => a.avgCost - b.avgCost);
  const bestColumn = columnCandidates[0];
  
  // 选中该列（从rank 0到当前rank的第一个item）
  let added = 0;
  for (let r = 0; r <= rankIndex; r++) {
    const rRank = treeData[r];
    const rColumn = rRank.researchable_vehicles[bestColumn.columnIndex];
    
    if (!rColumn || rColumn.length === 0) continue;
    
    selectedColumns.add(`${r}-${bestColumn.columnIndex}`);
    
    if (r < rankIndex) {
      // 低rank：选中整列
      rColumn.forEach((item, itemIndex) => {
        if (item.type === 'single') {
          if (!selectedVehicles.has(item.data_unit_id)) {
            addToSelected(selectedVehicles, item.data_unit_id, r, bestColumn.columnIndex, itemIndex, false, null, item.rp, item.sp);
            added++;
          }
        } else if (item.type === 'multiple') {
          const firstItem = item.items[0];
          if (!selectedVehicles.has(firstItem.data_unit_id)) {
            addToSelected(selectedVehicles, firstItem.data_unit_id, r, bestColumn.columnIndex, itemIndex, true, 0, firstItem.rp, firstItem.sp);
            added++;
          }
        }
      });
    } else {
      // 当前rank：只选第一个
      const firstItem = rColumn[0];
      if (firstItem.type === 'single') {
        if (!selectedVehicles.has(firstItem.data_unit_id)) {
          addToSelected(selectedVehicles, firstItem.data_unit_id, r, bestColumn.columnIndex, 0, false, null, firstItem.rp, firstItem.sp);
          added++;
        }
      } else if (firstItem.type === 'multiple') {
        const subItem = firstItem.items[0];
        if (!selectedVehicles.has(subItem.data_unit_id)) {
          addToSelected(selectedVehicles, subItem.data_unit_id, r, bestColumn.columnIndex, 0, true, 0, subItem.rp, subItem.sp);
          added++;
        }
      }
    }
  }
  
  return added;
}

/**
 * 统计指定rank中已选中的载具数量
 */
function countSelectedInRank(selectedVehicles, rankIndex) {
  let count = 0;
  selectedVehicles.forEach(vehicle => {
    if (vehicle.rankIndex === rankIndex) {
      count++;
    }
  });
  return count;
}

/**
 * 添加到选中列表
 */
function addToSelected(selectedVehicles, dataUnitId, rankIndex, columnIndex, itemIndex, isGroup, subItemIndex, rp, sp) {
  if (!selectedVehicles.has(dataUnitId)) {
    selectedVehicles.set(dataUnitId, {
      rankIndex,
      columnIndex,
      itemIndex,
      isGroup,
      subItemIndex,
      rp: rp === -1 ? 0 : rp,
      sp: sp === -1 ? 0 : sp
    });
  }
}

/**
 * 应用选中状态到tree_data
 */
function applySelections(treeData, selectedVehicles) {
  selectedVehicles.forEach((vehicle, dataUnitId) => {
    const rank = treeData[vehicle.rankIndex];
    const column = rank.researchable_vehicles[vehicle.columnIndex];
    
    if (!column) return;
    
    const item = column[vehicle.itemIndex];
    if (!item) return;
    
    if (vehicle.isGroup) {
      item.selected = true;
      if (item.items && item.items[vehicle.subItemIndex]) {
        item.items[vehicle.subItemIndex].selected = true;
      }
    } else {
      item.selected = true;
    }
  });
}

/**
 * 更新每个rank的selected字段
 */
function updateRankSelected(treeData) {
  treeData.forEach(rank => {
    rank.selected = [];
    
    // 收集普通载具
    rank.researchable_vehicles.forEach(column => {
      column.forEach(item => {
        if (item.type === 'single' && item.selected) {
          rank.selected.push({
            data_unit_id: item.data_unit_id,
            rp: item.rp === -1 ? 0 : item.rp,
            sp: item.sp === -1 ? 0 : item.sp
          });
        } else if (item.type === 'multiple' && item.items) {
          item.items.forEach(subItem => {
            if (subItem.selected) {
              rank.selected.push({
                data_unit_id: subItem.data_unit_id,
                rp: subItem.rp === -1 ? 0 : subItem.rp,
                sp: subItem.sp === -1 ? 0 : subItem.sp
              });
            }
          });
        }
      });
    });
    
    // 收集高级载具
    if (rank.premium_vehicles) {
      rank.premium_vehicles.forEach(column => {
        column.forEach(item => {
          if (item.type === 'single' && item.selected) {
            rank.selected.push({
              data_unit_id: item.data_unit_id,
              rp: item.rp === -1 ? 0 : item.rp,
              sp: item.sp === -1 ? 0 : item.sp
            });
          } else if (item.type === 'multiple' && item.items) {
            item.items.forEach(subItem => {
              if (subItem.selected) {
                rank.selected.push({
                  data_unit_id: subItem.data_unit_id,
                  rp: subItem.rp === -1 ? 0 : subItem.rp,
                  sp: subItem.sp === -1 ? 0 : subItem.sp
                });
              }
            });
          }
        });
      });
    }
  });
}
```

