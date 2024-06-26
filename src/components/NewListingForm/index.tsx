import { Delete } from '@mui/icons-material'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { AxiosError } from 'axios'
import { FormikHelpers, useFormik } from 'formik'
import { FC, memo, useCallback, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'

import { FileInput, Image } from '@/components'
import { useAuth, useHttpService, useWatchLoading } from '@/hooks'
import type { ImageFile } from '@/lib/definitions'
import {
  CAR_BRANDS,
  CAR_TYPES,
  CreateListingDto,
  ENGINE_TYPES,
} from '@/lib/listings'
import QueryKey from '@/lib/query-key'
import { fileToBase64 } from '@/lib/utils'

import {
  createListingInitialValues,
  createListingValidationSchema,
} from './constants'

const NewListingForm: FC = () => {
  const http = useHttpService()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [preview, setPreview] = useState<ImageFile | null>(null)

  const createListingMutation = useMutation((createDto: CreateListingDto) =>
    http.createListing(createDto),
  )

  useWatchLoading(createListingMutation.isLoading)

  const handlePreviewChange = useCallback(async (file: File) => {
    setPreview({
      file,
      body: await fileToBase64(file),
    })
  }, [])

  const handleSubmit = useCallback(
    async (
      formObject: CreateListingDto,
      helpers: FormikHelpers<CreateListingDto>,
    ) => {
      try {
        const createDto: CreateListingDto = {
          ...formObject,
          publisherId: user!.id,
        }

        if (preview) {
          createDto.preview = {
            fileName: preview.file.name,
            base64Body: preview.body!,
          }
        }

        await createListingMutation.mutateAsync(createDto, {
          onSuccess: () =>
            queryClient.invalidateQueries(QueryKey.LISTINGS_LIST),
        })
        helpers.resetForm()
        setPreview(null)
        toast('Listing created successfully.')
      } catch (err) {
        console.error(err)

        if (err instanceof AxiosError) {
          switch (err.response?.status) {
            case 400:
              toast('Validation error.', { type: 'error' })
              break
            case 401:
              toast('Unauthorized.', { type: 'error' })
              break
            case 403:
              toast('Not allowed.', { type: 'error' })
              break
            default:
              toast('Not allowed.', { type: 'error' })
              break
          }
        }
      }
    },
    [preview],
  )

  const formik = useFormik({
    initialValues: createListingInitialValues,
    onSubmit: handleSubmit,
    validationSchema: createListingValidationSchema,
    validateOnChange: false,
    validateOnMount: false,
    validateOnBlur: true,
  })

  return (
    <Box>
      <Grid
        container
        component="form"
        onSubmit={formik.handleSubmit}
        spacing={1}
      >
        <Grid item container xs={12} spacing={3}>
          {preview && (
            <Grid item xs={6}>
              <Image src={preview.body} />
            </Grid>
          )}
          <Grid
            item
            xs={!preview ? 12 : 6}
            display="flex"
            gap={3}
            alignItems="center"
          >
            {preview && (
              <IconButton onClick={() => setPreview(null)} color="error">
                <Delete fontSize="large" />
              </IconButton>
            )}
            <FileInput file={preview?.file} onChange={handlePreviewChange} />
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth error={!!formik.errors.brandName}>
            <InputLabel id="brandName-label">Brand</InputLabel>
            <Select
              label="Brand"
              labelId="brandName-label"
              value={formik.values.brandName ?? ''}
              onChange={(e) =>
                formik.setFieldValue('brandName', e.target.value)
              }
              error={!!formik.errors?.brandName}
            >
              {CAR_BRANDS.map((brandName) => (
                <MenuItem value={brandName} key={brandName}>
                  {brandName}
                </MenuItem>
              ))}
            </Select>
            {formik.errors.brandName && (
              <FormHelperText>{formik.errors.brandName}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={4}>
          <FormControl fullWidth error={!!formik.errors.type}>
            <InputLabel id="carType-label">Type</InputLabel>
            <Select
              label="Type"
              labelId="carType-label"
              value={formik.values.type ?? ''}
              error={!!formik.errors.type}
              onChange={(e) => formik.setFieldValue('type', e.target.value)}
            >
              {CAR_TYPES.map((type) => (
                <MenuItem value={type} key={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {formik.errors.type && (
              <FormHelperText>{formik.errors.type}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={4}>
          <FormControl fullWidth error={!!formik.errors.engineType}>
            <InputLabel id="engineType-label">Engine type</InputLabel>
            <Select
              label="Engine type"
              labelId="engineType-label"
              value={formik.values.engineType ?? ''}
              onChange={(e) =>
                formik.setFieldValue('engineType', e.target.value)
              }
              error={!!formik.errors.engineType}
            >
              {ENGINE_TYPES.map((type) => (
                <MenuItem value={type} key={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {formik.errors.engineType && (
              <FormHelperText>{formik.errors.engineType}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.modelName}>
            <TextField
              type="text"
              label="Model"
              value={formik.values.modelName ?? ''}
              onChange={(e) =>
                formik.setFieldValue('modelName', e.target.value)
              }
              error={!!formik.errors.modelName}
            />
            {formik.errors.modelName && (
              <FormHelperText>{formik.errors.modelName}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.color}>
            <TextField
              type="color"
              value={formik.values.color}
              label="Color"
              onChange={(e) => formik.setFieldValue('color', e.target.value)}
              error={!!formik.errors.color}
            />
            {formik.errors.color && (
              <FormHelperText>{formik.errors.color}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.price}>
            <TextField
              type="number"
              value={formik.values.price ?? ''}
              inputProps={{ min: 0 }}
              label="Price"
              onChange={(e) => formik.setFieldValue('price', e.target.value)}
              error={!!formik.errors.price}
            />
            {formik.errors.price && (
              <FormHelperText>{formik.errors.price}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.year}>
            <TextField
              type="number"
              value={formik.values.year ?? ''}
              inputProps={{ min: 0 }}
              label="Year"
              onChange={(e) => formik.setFieldValue('year', e.target.value)}
              error={!!formik.errors.year}
            />
            {formik.errors.year && (
              <FormHelperText>{formik.errors.year}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.clearance}>
            <TextField
              type="number"
              value={formik.values.clearance ?? ''}
              inputProps={{ min: 0 }}
              label="Clearance"
              onChange={(e) =>
                formik.setFieldValue('clearance', e.target.value)
              }
              error={!!formik.errors.clearance}
            />
            {formik.errors.clearance && (
              <FormHelperText>{formik.errors.clearance}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.wheelSize}>
            <TextField
              type="number"
              value={formik.values.wheelSize ?? ''}
              inputProps={{ min: 0 }}
              label="Wheel size"
              onChange={(e) =>
                formik.setFieldValue('wheelSize', e.target.value)
              }
              error={!!formik.errors.wheelSize}
            />
            {formik.errors.wheelSize && (
              <FormHelperText>{formik.errors.wheelSize}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.engineVolume}>
            <TextField
              type="number"
              value={formik.values.engineVolume ?? ''}
              inputProps={{ min: 0, step: 0.1 }}
              label="Engine volume"
              onChange={(e) =>
                formik.setFieldValue('engineVolume', e.target.value)
              }
              error={!!formik.errors.engineVolume}
            />
            {formik.errors.engineVolume && (
              <FormHelperText>{formik.errors.engineVolume}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.horsepower}>
            <TextField
              type="number"
              value={formik.values.horsepower ?? ''}
              inputProps={{ min: 0 }}
              label="Horsepower"
              onChange={(e) =>
                formik.setFieldValue('horsepower', e.target.value)
              }
              error={!!formik.errors.horsepower}
            />
            {formik.errors.horsepower && (
              <FormHelperText>{formik.errors.horsepower}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth error={!!formik.errors.mileage}>
            <TextField
              type="number"
              value={formik.values.mileage ?? ''}
              inputProps={{ min: 0 }}
              label="Mileage"
              onChange={(e) => formik.setFieldValue('mileage', e.target.value)}
              error={!!formik.errors.mileage}
            />
            {formik.errors.mileage && (
              <FormHelperText>{formik.errors.mileage}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" type="submit">
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default memo(NewListingForm)
