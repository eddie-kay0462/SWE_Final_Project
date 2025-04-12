/**
 * Custom Supabase Data Hook
 * 
 * <p>Provides utilities for fetching and interacting with data from Supabase
 * across the application. Handles caching, loading states, and error handling.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/hooks/useAuth'

/**
 * Custom hook for Supabase data operations
 * 
 * @param {string} table - The Supabase table to interact with
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch data automatically on mount (defaults to true)
 * @param {string|Object} options.initialFilter - Initial filter configuration
 * @param {Array} options.dependencies - Dependencies for automatic re-fetching
 * @return {Object} Data fetching state and utility functions
 */
export function useSupabaseData(table, options = {}) {
  const {
    autoFetch = true,
    initialFilter = null,
    dependencies = []
  } = options
  
  const supabase = createClient()
  const { user } = useAuth()
  
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState(initialFilter)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0
  })

  /**
   * Fetches data from Supabase with the current filter and pagination
   *
   * @param {Object} fetchOptions - Additional fetch options
   * @param {boolean} fetchOptions.countTotal - Whether to count total records
   * @param {string} fetchOptions.additionalSelect - Additional fields to select
   * @return {Promise<Object>} Fetch result with data and count
   */
  const fetchData = useCallback(async (fetchOptions = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const { countTotal = true, additionalSelect = '*' } = fetchOptions
      
      // Build query
      let query = supabase
        .from(table)
        .select(additionalSelect, { count: countTotal })
      
      // Apply filters if they exist
      if (filter) {
        if (typeof filter === 'object') {
          // Handle complex filter object
          Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (typeof value === 'object' && value.operator) {
                // Handle custom operator filters like { operator: 'lt', value: 100 }
                query = query[value.operator](key, value.value)
              } else {
                // Default to equality filter
                query = query.eq(key, value)
              }
            }
          })
        } else if (typeof filter === 'function') {
          // Allow the filter to be a function that receives and modifies the query
          query = filter(query)
        }
      }
      
      // Apply pagination
      const { page, pageSize } = pagination
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1
      
      query = query.range(start, end)
      
      // Execute query
      const { data: fetchedData, error: fetchError, count: totalCount } = await query
      
      if (fetchError) {
        throw fetchError
      }
      
      setData(fetchedData || [])
      
      if (countTotal && totalCount !== null) {
        setCount(totalCount)
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(totalCount / pageSize)
        }))
      }
      
      return { data: fetchedData, count: totalCount }
    } catch (err) {
      console.error(`Error fetching data from ${table}:`, err)
      setError(err.message)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [supabase, table, filter, pagination])

  /**
   * Creates a new record in the Supabase table
   *
   * @param {Object} record - The record to create
   * @param {boolean} refetchAfter - Whether to refetch data after creation
   * @return {Promise<Object>} Create operation result
   */
  const createRecord = async (record, refetchAfter = true) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: createdData, error: createError } = await supabase
        .from(table)
        .insert(record)
        .select()
      
      if (createError) {
        throw createError
      }
      
      if (refetchAfter) {
        await fetchData()
      }
      
      return { success: true, data: createdData }
    } catch (err) {
      console.error(`Error creating record in ${table}:`, err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Updates an existing record in the Supabase table
   *
   * @param {string|number} id - ID of the record to update
   * @param {Object} updates - Fields to update
   * @param {boolean} refetchAfter - Whether to refetch data after update
   * @param {string} idField - The field to use as ID (defaults to 'id')
   * @return {Promise<Object>} Update operation result
   */
  const updateRecord = async (id, updates, refetchAfter = true, idField = 'id') => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: updatedData, error: updateError } = await supabase
        .from(table)
        .update(updates)
        .eq(idField, id)
        .select()
      
      if (updateError) {
        throw updateError
      }
      
      if (refetchAfter) {
        await fetchData()
      } else {
        // Update the local state without refetching
        setData(prevData => 
          prevData.map(item => item[idField] === id ? { ...item, ...updates } : item)
        )
      }
      
      return { success: true, data: updatedData }
    } catch (err) {
      console.error(`Error updating record in ${table}:`, err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Deletes a record from the Supabase table
   *
   * @param {string|number} id - ID of the record to delete
   * @param {boolean} refetchAfter - Whether to refetch data after deletion
   * @param {string} idField - The field to use as ID (defaults to 'id')
   * @return {Promise<Object>} Delete operation result
   */
  const deleteRecord = async (id, refetchAfter = true, idField = 'id') => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq(idField, id)
      
      if (deleteError) {
        throw deleteError
      }
      
      if (refetchAfter) {
        await fetchData()
      } else {
        // Update the local state without refetching
        setData(prevData => prevData.filter(item => item[idField] !== id))
      }
      
      return { success: true }
    } catch (err) {
      console.error(`Error deleting record from ${table}:`, err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Changes the current page in pagination
   *
   * @param {number} page - Page number to change to
   */
  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  /**
   * Changes the page size in pagination
   *
   * @param {number} pageSize - New page size
   */
  const changePageSize = useCallback((pageSize) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize,
      page: 1, // Reset to first page when changing page size
    }))
  }, [])

  /**
   * Updates the filter criteria and optionally refetches data
   *
   * @param {Object} newFilter - New filter to apply
   * @param {boolean} resetPagination - Whether to reset pagination to first page
   */
  const updateFilter = useCallback((newFilter, resetPagination = true) => {
    setFilter(newFilter)
    if (resetPagination) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [])

  // Auto-fetch data when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [fetchData, autoFetch, ...dependencies])

  return {
    data,
    count,
    loading,
    error,
    filter,
    pagination,
    fetchData,
    createRecord,
    updateRecord,
    deleteRecord,
    changePage,
    changePageSize,
    updateFilter,
  }
}

export default useSupabaseData 